import { CandidateProficiency, DifficultyLevel, DomainProficiencyMap, QuestionEvaluation } from "./types";

export class DifficultyController {
  private static proficiencyLevels: CandidateProficiency[] = [
    "Beginner",
    "Developing",
    "Competent",
    "Strong",
    "Expert",
  ];

  private static difficultyLevels: DifficultyLevel[] = [
    "Easy",
    "Medium",
    "Hard",
    "Expert",
  ];

  public static calculateUpdatedProficiency(
    currentProficiency: CandidateProficiency,
    recentEvaluations: QuestionEvaluation[]
  ): CandidateProficiency {
    if (recentEvaluations.length === 0) return currentProficiency;

    const lastThree = recentEvaluations.slice(-3);
    const avgScore = Math.round(
      lastThree.reduce((sum, e) => sum + e.overallScore, 0) / lastThree.length
    );

    let idx = this.proficiencyLevels.indexOf(currentProficiency);
    if (idx === -1) idx = 2; // Default Competent

    if (avgScore >= 85 && lastThree.length >= 2 && idx < this.proficiencyLevels.length - 1) {
      idx++;
    } else if (avgScore < 60 && lastThree.length >= 2 && idx > 0) {
      idx--;
    }

    return this.proficiencyLevels[idx];
  }

  public static calculateNextDifficulty(
    currentDifficulty: DifficultyLevel,
    evaluations: QuestionEvaluation[]
  ): DifficultyLevel {
    if (evaluations.length === 0) return currentDifficulty;

    const lastTwo = evaluations.slice(-2);
    const avgScore = Math.round(
      lastTwo.reduce((sum, e) => sum + e.overallScore, 0) / lastTwo.length
    );

    let idx = this.difficultyLevels.indexOf(currentDifficulty);
    if (idx === -1) idx = 1; // Default Medium

    if (avgScore >= 85 && lastTwo.length >= 2 && idx < this.difficultyLevels.length - 1) {
      idx++;
    } else if (avgScore < 60 && lastTwo.length >= 2 && idx > 0) {
      idx--;
    }

    return this.difficultyLevels[idx];
  }

  public static updateDomainProficiency(
    domainMap: DomainProficiencyMap,
    domain: string,
    evaluation: QuestionEvaluation
  ): DomainProficiencyMap {
    const current = domainMap[domain] || "Competent";
    let idx = this.proficiencyLevels.indexOf(current);
    if (idx === -1) idx = 2;

    if (evaluation.overallScore >= 85 && idx < this.proficiencyLevels.length - 1) {
      idx++;
    } else if (evaluation.overallScore < 60 && idx > 0) {
      idx--;
    }

    return {
      ...domainMap,
      [domain]: this.proficiencyLevels[idx],
    };
  }
}
