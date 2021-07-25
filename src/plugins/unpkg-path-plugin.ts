import * as esbuild from 'esbuild-wasm';
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache"
});
 
export const unpkgPathPlugin = (inputCode: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {

      // Handle root entry file of "index.js"
      build.onResolve({ filter: /(^index\.js$)/}, () => {
        return {path: "index.js", namespace: "a"};
      });

      // Handle relative paths in a module
      build.onResolve({filter: /^\.+\//}, (args: any) => {
        return {
          namespace: "a",
          path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href
        }
      });

      // Handle main file of a module 
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        // if we have a path other than index.js
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`                         
        }
      });

      // onLoad file is used to load up a file from the file system
      // if we define an onLoad function in our plugin, we override ESbuild's natural process of trying to access the filesystem
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);
 
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
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        // if it is, return it immediately
        if (cachedResult){
          return cachedResult;
        }
        const { data, request } = await axios.get(args.path);
        
        const result: esbuild.OnLoadResult =  {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname
        }

        // store in cache
        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};