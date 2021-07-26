import "bulmaswatch/superhero/bulmaswatch.min.css"
import * as esbuild from "esbuild-wasm";
import {useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import CodeEditor from "./components/code-editor";
import Preview from "./components/preview"

const App = () => {
  const ref = useRef<any>();
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");

  // initialize esbuild 
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm"
    });
  }

  // the second empty array argument makes sure that this useEffect hook is run once only when the App component is initialized
  useEffect(() => {
    startService();
  }, [])

  const onClick = async () => {
    // if the user clicks the submit button as soon as the webpage starts up
    // So there might a possiblity that esbuild hasn't loaded by then so we would need to stop 
    if (!ref.current){
      return;
    }

    // transform transpiles code. It doen't do any bunndling
    // build is bundling
    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: 'window'
      }
    });

    setCode(result.outputFiles[0].text);
  }

  return <div>
    <CodeEditor 
      initialValue = "const a = 1;"
      onChange = {value => setInput(value)}
    />
    <div>
      <button onClick = {onClick}>Submit</button>
    </div>
    <Preview code = {code}/>
  </div>
}

ReactDOM.render(
  <App/>,
  document.querySelector("#root")
)