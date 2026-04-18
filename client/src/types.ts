export type Language = "English" | "Spanish" | "German" | "Russian";

export type SyntaxTreeNode = {
  name: string;
  children?: SyntaxTreeNode[];
};

export type GrammarPart = {
  token: string;
  pos: string;
  explanation: string;
};

export type AnalysisResult = {
  translation: string;
  grammarAnalysis: {
    summary: string;
    partsOfSpeech: GrammarPart[];
    keyGrammarPoints: string[];
  };
  syntaxTree: SyntaxTreeNode;
  translationsByLanguage: Record<Language, string>;
  structureDifferences: string[];
};
