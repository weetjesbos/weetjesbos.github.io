/*
 * Quiz-speler: overloopt de vragen van een oefening één voor één.
 *
 * Elke vraag heeft een `type` dat verwijst naar een geregistreerd vraagtype
 * (zie js/core/questions). Een vraagtype heeft één functie:
 *   ask(vraag, game) -> Promise die afloopt als de vraag klaar is.
 * Het vraagtype roept zelf game.correct()/game.wrong() op.
 */
App.runQuiz = async function runQuiz(exercise, game) {
  const questions = exercise.questions();
  for (const [i, question] of questions.entries()) {
    if (!game.alive) return;
    const type = App.questionTypes[question.type];
    if (!type) throw new Error(`Onbekend vraagtype '${question.type}'`);
    game.setProgress(i, questions.length);
    game.clear();
    await type.ask(question, game);
  }
  game.finish({ max: questions.length });
};
