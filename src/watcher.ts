export const createClassesWatcher = (
    callback: (classNames: string[]) => void,
    initialClassNames: string[] = []
): () => void => {
    const classNames = [ ...initialClassNames ];
    const classNamesSet = new Set(classNames);
    const usedElements = new WeakSet;

    const collectElementClasses = (element: Element) => {
        let didAddClasses = false;
        for (const className of element.classList) {
            if (classNamesSet.has(className)) {
                continue;
            }
            didAddClasses = true;
            classNames.push(className);
            classNamesSet.add(className);
        }
        return didAddClasses;
    };

    const collectSubtreeClasses = (root: Element): boolean => {
        if (usedElements.has(root)) {
            return false;
        }
        usedElements.add(root);

        let didAddClasses = false;
        if (collectElementClasses(root)) {
            didAddClasses = true;
        }

        for (const child of root.children) {
            if (collectSubtreeClasses(child)) {
                didAddClasses = true;
            }
        }

        return didAddClasses;
    };

    const observer = new MutationObserver(entries => {
        let didAddClasses = false;
        for (const entry of entries) {
            switch (entry.type) {
                case 'attributes':
                    if (collectElementClasses(entry.target as Element)) {
                        didAddClasses = true;
                    }
                    break;

                case 'childList':
                    for (const node of entry.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (collectSubtreeClasses(node as Element)) {
                                didAddClasses = true;
                            }
                        }
                    }
                    break;
            }
        }

        if (didAddClasses) {
            callback(classNames);
        }
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: [ 'class' ],
        childList: true,
        subtree: true
    });

    collectSubtreeClasses(document.documentElement);

    try {
        callback(classNames);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }

    return () => {
        observer.disconnect();
    };
};
