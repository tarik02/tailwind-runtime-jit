import { createRemoteCompiler } from './remote-compiler.js';
import { createClassesWatcher } from './watcher.js';

export const createRuntime = ({ apiUrl }: { apiUrl: string }) => {
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);

    document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(styleElement);
    });

    const applyStyles = (styles: string): void => {
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    };

    const compiler: ReturnType<typeof createRemoteCompiler> = createRemoteCompiler({
        apiUrl
    });
    let classNames: string[] = [];

    const close = createClassesWatcher(newClassNames => {
        classNames = newClassNames;
        compiler(classNames).then(styles => {
            if (classNames === newClassNames) {
                applyStyles(styles);
            }
        });
    });

    return {
        close
    };
};
