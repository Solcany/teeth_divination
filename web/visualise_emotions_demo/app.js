document.addEventListener("DOMContentLoaded", function() {

  const PROBABILITY_EL_WIDTH_MIN = 5;
  const PROBABILITY_EL_WIDTH_MAX = 50;

  function rerange(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }

  function visualise(data) {
    console.log(data);

    let container_el = document.createElement("ul");

    data.forEach((d) => {
      let datum_el = document.createElement("li");
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
        let stat_el = document.createElement("li");

        let probability_el = document.createElement("span");
        probability_el.classList.add("probability");
        let width = rerange(parseFloat(probabilities[i]), 0.0 , 1.0, PROBABILITY_EL_WIDTH_MIN, PROBABILITY_EL_WIDTH_MAX);
        width = Math.round(width);
        probability_el.style.width = width + "px";

        let label_el = document.createElement("span");
        label_el.classList.add("label");
        label_el.innerHTML = labels[i];

        stat_el.appendChild(probability_el);
        stat_el.appendChild(label_el);
        stats_el.appendChild(stat_el);
      }

      datum_el.appendChild(sentence_el);
      datum_el.appendChild(stats_el);

      container_el.appendChild(datum_el);
    })

    document.body.appendChild(container_el);
  }


  fetch('./data/mask16_emotions.json')
    .then(response => response.json())
    .then(data => visualise(data))
    .catch(error => console.log(error));
});
