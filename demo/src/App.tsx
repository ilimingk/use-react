import React from "react";
import { createStateContext } from "use-react";

const { Provider, useUpdate, useWatch } = createStateContext<{
  a: string;
  b: number;
  c: {
    a: string[];
    b: number[];
  };
  d: string[];
}>();

const A = () => {
  const update = useUpdate();
  console.log("A");
  return (
    <button
      onClick={() => {
        update((s) => ({
          ...s,
          b: s.b + 1,
        }));
      }}
    >
      btn
    </button>
  );
};

const B = () => {
  console.log("B");
  const b = useWatch((s) => s.b);

  return <div>{b}</div>;
};

const C = () => {
  const a = useWatch((s) => s.c.a);
  console.log("C");
  return (
    <div>
      {a.map((a) => (
        <h1 key={a}>{a}</h1>
      ))}
    </div>
  );
};

const D = () => {
  const u = useUpdate();
  console.log("D");
  return (
    <button
      onClick={() => {
        u((s) => ({
          ...s,
          c: {
            ...s.c,
            a: s.c.a.concat(new Date().valueOf().toString()),
            b: s.c.b.concat(new Date().valueOf()),
          },
        }));
      }}
    >
      btn U
    </button>
  );
};

function App() {
  return (
    <div className="App">
      <Provider
        state={{
          a: "a",
          b: 0,
          c: {
            a: ["ca"],
            b: [0],
          },
          d: [""],
        }}
      >
        <A />
        <B />
        <C />
        <D />
      </Provider>
    </div>
  );
}

export default App;
