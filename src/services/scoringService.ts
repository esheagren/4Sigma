class Score {
  static score = 0;

  static getScore() {
    return this.score;
  }

  static setScore(score) {
    this.score = score;
  }

  static calculateScore(lower, upper, answer) {
    if (Score.inBounds(lower, upper, answer)) {
      return this.computeScore(lower, upper, answer);
    } else {
      return -1;
    }
  }

  static computeScore(lower, upper, answer) {
    // Handle exact matches by adding a small epsilon to avoid log(0)
    const epsilon = 1e-10;
    if (lower === upper) {
      lower -= epsilon;
      upper += epsilon;
    }

    let upperLog = Math.log10(upper + 1.1);
    let lowerLog = Math.log10(lower + 1.1);
    let answerLog = Math.log10(answer + 1.1);
    let upperLogMinusLowerLog = Math.log10(upperLog - lowerLog);
    let upperMinusLower = upperLog - lowerLog;
    let allThree = answerLog - 2 * upperLog - 2 * lowerLog;
    let pow = Math.pow(allThree / upperMinusLower, 2);

    let algo = upperLogMinusLowerLog / 4 + 2 * pow;
    let comp = Math.sqrt(algo);
    return comp;
  }

  static inBounds(lowerBound, upperBound, answer) {
    return lowerBound <= answer && upperBound >= answer;
  }
}

export default Score;