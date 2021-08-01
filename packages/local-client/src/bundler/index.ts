import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

let service: esbuild.Service;

const esBuildInit =  async (rawCode: string) => {
  if (!service){
    service = await esbuild.startService({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm"
    });
  }

  try{
    const result = await service.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: 'window'
      },
      jsxFactory: "__React__.createElement",
      jsxFragment: "__React__.Fragment"
    });
    return {
      code: result.outputFiles[0].text,
      err: ""
    };
  } catch (error){
    return {
      code: "",
      err: error.message
    };
  }
}

export default esBuildInit;