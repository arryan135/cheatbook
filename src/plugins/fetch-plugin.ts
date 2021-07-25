import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache"
});

// onLoad file is used to load up a file from the file system
// if we define an onLoad function in our plugin, we override ESbuild's natural process of trying to access the filesystem
export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // if esbuild is attempting to load the index.js file dont let it do its normal thing
        // dont let it load a file from the file system. We loaded it for you using the return object
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            // in the contents it tries to find any require/imports and after finding any it runs the 
            contents: inputCode,
          };
        } 

        // Check to see if we have already loaded this file and if it is in the cache
        // const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        // // if it is, return it immediately
        // if (cachedResult){
        //   return cachedResult;
        // }
        const { data, request } = await axios.get(args.path);
        const fileType = args.path.match(/.css$/) ? "css" : "jsx";
        // remove quotations from the css file to enabled valid js
        const escaped = data
          .replace(/\n/g, "")   // newlines removed
          .replace(/"/g, '\\"') // double quotes escaped
          .replace(/'/g, "\\'") // single quotes escaped
        const contents = fileType === "css" ? 
          `
            const style = document.createElement("style");
            style.innerText = '${escaped}';
            document.head.appendChild(style);
          ` : data;

        const result: esbuild.OnLoadResult =  {
          loader : "jsx",
          contents,
          resolveDir: new URL("./", request.responseURL).pathname
        }

        // store in cache if not already in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    }
  }
}