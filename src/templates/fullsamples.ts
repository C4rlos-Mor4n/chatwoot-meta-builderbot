import { addKeyword } from "@builderbot/bot";

const fullSamplesFlow = addKeyword(["full", "samples"])
  .addAnswer(`💪 I'll send you a lot files...`)
  .addAnswer(`Send video from URL`, {
    media:
      "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4",
  })
  .addAnswer(`Send audio from URL`, {
    media: "https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3",
  })
  .addAnswer(`Send file from URL`, {
    media:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  });

export { fullSamplesFlow };
