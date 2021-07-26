import * as esbuild from "esbuild-wasm";
import {useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

const App = () => {
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");

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
    // setCode(result.outputFiles[0].text);
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, "*");
  }
  const html = `
    <html>
      <head></head>
      <body>
        <div id = "root"></div>
        <script>
          window.addEventListener("message", (event) => {
            eval(event.data);
          }, false);
        </script>
      </body>
    </html>
  `
  return <div>
    <textarea value = {input} onChange = {e => setInput(e.target.value)}></textarea>
    <div>
      <button onClick = {onClick}>Submit</button>
    </div>
    <pre>{code}</pre>
    <iframe ref = {iframe} title = "_iframe" sandbox = "allow-scripts" srcDoc = {html}/>
  </div>
}

ReactDOM.render(
  <App/>,
  document.querySelector("#root")
)