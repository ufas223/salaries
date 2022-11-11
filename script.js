// Generated by CoffeeScript 2.7.0
var plot_data;
d3.json("salaries.json").then(function (salaries) {
  return d3.json("titles.json").then(function (titles) {
    return d3.json("divisions.json").then(function (divisions) {
      var dropdown, i, jobcodes, opts, person_division, person_index, title, v, x;
      dropdown = d3.select("body").select("select#division");
      opts = dropdown.selectAll("option").data(divisions).enter().append("option").text(function (d) {
        return d;
      }).attr("value", function (d) {
        return d;
      });
      // insert title into salaries dataset
      salaries.forEach(function (d) {
        return d.title = titles[d.JobCode];
      });
      // create object that has title -> job codes
      jobcodes = {};
      for (x in titles) {
        title = titles[x];
        if (!(jobcodes[title] != null)) {
          jobcodes[title] = [];
        }
        jobcodes[title].push(x);
      }
      // index of people: vector with {name: first|last|div, index: numeric index}
      person_division = function () {
        var j, len, results;
        results = [];
        for (j = 0, len = salaries.length; j < len; j++) {
          v = salaries[j];
          results.push([v.FirstName, v.LastName, v.Division].join("|"));
        }
        return results;
      }();
      person_index = [];
      for (i in person_division) {
        person_index.push({
          name: person_division[i],
          index: i
        });
      }
      // add
      return d3.select("button").on("click", function () {
        return plot_data(salaries, divisions, jobcodes, person_index);
      });
    });
  });
});
plot_data = function (salaries, divisions, jobcodes, person_index) {
  var all_indices, comp_salaries, d, data_to_plot, first_name, index_in_data, labels, last_name, mychart, salaries_subset, salary, scope, scope_across, selected_div, target_jobcodes, this_person, this_record, title;
  // grab form data
  last_name = d3.select("input#last_name").property("value");
  first_name = d3.select("input#first_name").property("value");
  // division
  selected_div = d3.select("select#division option:checked").text();
  // scope
  scope_across = d3.select("input#across").property("checked");
  scope = scope_across ? "across" : "within";
  // look for the person in the data
  this_person = [first_name, last_name, divisions.indexOf(selected_div) + 1].join("|").toUpperCase();
  index_in_data = person_index.find(function (d) {
    return d.name === this_person;
  });
  if (index_in_data != null) {
    // if multiple records for that person: pick a random one?
    all_indices = person_index.filter(function (d) {
      return d.name === this_person;
    });
    if (all_indices.length > 1) {
      // pick a random one
      index_in_data = all_indices[Math.floor(Math.random() * all_indices.length)];
    }
    d3.select("div#chart").text(`Yay we found ${first_name} ${last_name} in ${selected_div}`);
    this_record = salaries[index_in_data.index];
    title = this_record.title;
    salary = this_record.AnnualSalary;
    target_jobcodes = jobcodes[title];
    console.log([title, salary]);
    console.log(target_jobcodes);
    salaries_subset = salaries.filter(function (d) {
      return target_jobcodes.indexOf(d.JobCode) >= 0;
    });
    if (scope === "within") {
      // subset by division
      salaries_subset = salaries_subset.filter(function (d) {
        return d.Division === this_record.Division;
      });
    }
    comp_salaries = function () {
      var j, len, results;
      results = [];
      for (j = 0, len = salaries_subset.length; j < len; j++) {
        d = salaries_subset[j];
        results.push(d.AnnualSalary);
      }
      return results;
    }();
    labels = function () {
      var j, len, results;
      results = [];
      for (j = 0, len = salaries_subset.length; j < len; j++) {
        d = salaries_subset[j];
        results.push(d.FirstName + " " + d.LastName);
      }
      return results;
    }();
    console.log(comp_salaries);
    mychart = d3panels.dotchart({
      xlab: "",
      ylab: "Salaries",
      title: "",
      height: 300,
      width: 800,
      horizontal: true
    });
    data_to_plot = {
      x: function () {
        var j, len, results;
        results = [];
        for (j = 0, len = comp_salaries.length; j < len; j++) {
          d = comp_salaries[j];
          results.push(" ");
        }
        return results;
      }(),
      y: comp_salaries,
      indID: labels
    };
    return mychart(d3.select("div#chart"), data_to_plot);
  } else {
    return d3.select("div#chart").text(`${first_name} ${last_name} not found in ${selected_div}`); // individual was found
  }
};

// dotplot of those points
// add boxplot over the dotplot