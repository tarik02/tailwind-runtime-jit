export const createClassesWatcher = (
  callback: (classNames: string[]) => void,
  initialClassNames: string[] = [],
): () => void => {
  const classNames = [...initialClassNames];
  const classNamesSet = new Set(classNames);

  const collectNewClassNames = () => {
    let didAddClasses = false;
    for (const element of document.querySelectorAll('[class]')) {
      for (const className of element.classList) {
        if (classNamesSet.has(className)) {
          continue;
        }
        didAddClasses = true;
        classNames.push(className);
        classNamesSet.add(className);
      }
    }
    return didAddClasses;
  };

  collectNewClassNames();
  Promise.resolve().then(() => callback(classNames));

  const observer = new MutationObserver(async () => {
    if (collectNewClassNames()) {
      callback(classNames);
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true
  });

  return () => {
    observer.disconnect();
  };
};
