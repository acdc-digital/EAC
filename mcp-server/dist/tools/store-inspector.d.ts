/**
 * EAC Store Inspector
 * Inspects Zustand stores and state management patterns
 */
export declare class EACStoreInspector {
    private projectRoot;
    constructor(projectRoot: string);
    inspectStores(args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    getPatterns(): Promise<string>;
}
//# sourceMappingURL=store-inspector.d.ts.map