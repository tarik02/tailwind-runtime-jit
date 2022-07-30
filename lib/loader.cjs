let loaderPromise;

exports.pitch = async function (...args) {
  if (loaderPromise === undefined) {
    loaderPromise = import('tailwind-runtime-jit/loader');
  }

  return await (await loaderPromise).pitch.apply(this, args);
};
