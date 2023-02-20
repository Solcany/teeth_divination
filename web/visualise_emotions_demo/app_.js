document.addEventListener("DOMContentLoaded", function() {

  const PROBABILITY_EL_WIDTH_MIN = 1;
  const PROBABILITY_EL_WIDTH_MAX = 100;
  const MIN_PROBABILITY = 0.05;

  function rerange(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  function visualise(data, htmlBefore=[]) {
    console.log(data);

    let container_el = document.createElement("ol");
    container_el.classList.add("container");

    data.forEach((d) => {
      let datum_el = document.createElement("li");
      datum_el.classList.add("emotion_container");
      let sentence_el = document.createElement("span");
      sentence_el.innerHTML = d.sentence;
      sentence_el.classList.add("sentence");

      let stats_el = document.createElement("ul");
      stats_el.classList.add("stats");

      // labels and probabilities are ordered from low to high
      // reverse the order to visualise them in high to low order
      let labels = d.labels.reverse();
      let probabilities = d.probabilities.reverse();

      for(let i = 0; i < labels.length; i++) {
        let probability = probabilities[i]

        if(probability > MIN_PROBABILITY) {
          let stat_el = document.createElement("li");
          let probability_wrapper_el = document.createElement("span");
          probability_wrapper_el.classList.add("probability_wrapper")
          probability_wrapper_el.style.width = PROBABILITY_EL_WIDTH_MAX + "px";

          let probability_el = document.createElement("span");
          probability_el.classList.add("probability");
          let width = rerange(parseFloat(probability), 0.0 , 1.0, PROBABILITY_EL_WIDTH_MIN, PROBABILITY_EL_WIDTH_MAX);
          width = Math.round(width);
          probability_el.style.width = width + "px";

          probability_wrapper_el.appendChild(probability_el);

          let label_el = document.createElement("span");
          label_el.classList.add("label");
          label_el.innerHTML = labels[i];

          stat_el.appendChild(probability_wrapper_el);
          stat_el.appendChild(label_el);
          stats_el.appendChild(stat_el);
        } else {
          continue
        }
      }

      let datum_wrapper_el = document.createElement("div");
      datum_wrapper_el.classList.add("emotion_wrapper");
      datum_wrapper_el.appendChild(sentence_el);
      datum_wrapper_el.appendChild(stats_el);
      datum_el.appendChild(datum_wrapper_el);
      container_el.appendChild(datum_el);
    })

    if(htmlBefore.length > 0) {
      htmlBefore.forEach((el) => {
        document.body.appendChild(el);
      })
    }
    document.body.appendChild(container_el);
  }

  let h2 = document.createElement("h2");
  h2.innerHTML = "detection in sentences"
  document.body.appendChild(h2);

  fetch('./data/mask16_emotions.json')
    .then(response => response.json())
    .then(data => visualise(data, [h2]))
    .catch(error => console.log(error));

  h2 = document.createElement("h2");
  h2.innerHTML = "detection in paragraphs";
  document.body.appendChild(h2);

  fetch('./data/mask16_paragraphs_emotions.json')
    .then(response => response.json())
    .then(data => visualise(data, [h2]))
    .catch(error => console.log(error));
});
