declare module 'simple-functional-loader' {
  import { LoaderDefinitionFunction } from 'webpack';

  export function createLoader(processor: LoaderDefinitionFunction): string;
}
