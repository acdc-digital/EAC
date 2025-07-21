/**
 * EAC Code Generator
 * Generates code scaffolding following EAC patterns
 */
export declare class EACCodeGenerator {
    private projectRoot;
    constructor(projectRoot: string);
    generateCode(args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
}
//# sourceMappingURL=code-generator.d.ts.map