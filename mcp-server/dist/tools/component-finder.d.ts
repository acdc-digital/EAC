/**
 * EAC Component Finder
 * Finds and analyzes React components in the EAC project
 */
export declare class EACComponentFinder {
    private projectRoot;
    constructor(projectRoot: string);
    findComponents(args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    generateComponentCatalog(): Promise<string>;
    getPatterns(): Promise<string>;
}
//# sourceMappingURL=component-finder.d.ts.map