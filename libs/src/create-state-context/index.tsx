import React from 'react';

export const createStateContext = <S extends unknown>(initState?: S) => {
  const stateCache = { state: initState as S };

  type Fn = (s: S) => void;

  const symbol = Symbol('memoryKey');

  type Fns = Record<number, Fn> & {
    [symbol]: number;
  };

  const fns: Fns = { [symbol]: 0 };

  const subscriber = (fn: Fn) => {
    fns[symbol] += 1;
    fns[fns[symbol]] = fn;
    return fns[symbol];
  };

  const removeSubscriber = (key: number) => void delete fns[key];

  type FnS = (preS: S) => S;

  const publisher = (s: S | FnS) => {
    stateCache.state =
      typeof s === 'function' ? (s as FnS)(stateCache.state) : s;
    Object.entries(fns).forEach(
      ([__, fn]) => void (fn as Fn)(stateCache.state)
    );
  };

  type ContextValue = {
    subscriber: typeof subscriber;
    removeSubscriber: typeof removeSubscriber;
    publisher: typeof publisher;
  };

  const Context = React.createContext<ContextValue>({
    subscriber,
    removeSubscriber,
    publisher,
  });

  const Provider: React.FC<{
    state: S;
  }> = (props) => {
    const firstEnter = React.useRef(true);

    if (firstEnter.current && props.hasOwnProperty('state')) {
      stateCache.state = props.state;
      firstEnter.current = false;
    }

    return (
      <Context.Provider value={{ subscriber, removeSubscriber, publisher }}>
        {props.children}
      </Context.Provider>
    );
  };

  const useUpdate = () => {
    const { publisher } = React.useContext(Context);

    return React.useCallback((s: S | FnS) => publisher(s), []);
  };

  type SelectorFn<R> = (data: S) => R;

  function useWatch(): S;

  function useWatch<R>(selectorFn?: SelectorFn<R>): R;

  function useWatch<R>(selectorFn?: SelectorFn<R>) {
    const { subscriber, removeSubscriber } = React.useContext(Context);

    const [state, setState] = React.useState<R | S>(() =>
      selectorFn ? selectorFn(stateCache.state) : stateCache.state
    );

    const fnRef = React.useRef(selectorFn);

    fnRef.current = selectorFn;

    React.useEffect(() => {
      const key = subscriber((s) => {
        setState(fnRef.current ? fnRef.current(s) : s);
      });
      return () => void removeSubscriber(key);
    }, []);

    return state;
  }

  return {
    Provider,
    useUpdate,
    useWatch,
  };
};
