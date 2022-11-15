// Generated by CoffeeScript 2.7.0
var five_number_summary, plot_data;
d3.json("salaries.json").then(function (salaries) {
  return d3.json("titles.json").then(function (titles) {
    return d3.json("salary_ranges.json").then(function (salary_ranges) {
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
        // button click -> make plot
        return d3.select("button").on("click", function () {
          return plot_data(salaries, divisions, jobcodes, salary_ranges, person_index);
        });
      });
    });
  });
});
plot_data = function (salaries, divisions, jobcodes, salary_ranges, person_index) {
  var all_indices, comp_salaries, d, data_to_plot, end_range_text, first_name, g, g_range, green, group, i, index_in_data, j, labels, last_name, len, mychart, orange, plot_title, range, range_max, range_min, range_text, ref, salaries_subset, salary, salary_range, scope, scope_across, selected_div, sr_range, start_range_text, summary, target_jobcodes, this_index, this_person, this_record, title, val, vert_line_labels, vert_lines, vert_lines_tooltip, y1, y2, ym, ymax, ymin;
  d3.select("div#chart svg").remove();
  d3.selectAll("g.d3panels-tooltip").remove();
  d3.select("div#text_output").html("");
  // grab form data
  last_name = d3.select("input#last_name").property("value").toUpperCase();
  first_name = d3.select("input#first_name").property("value").toUpperCase();
  // division
  selected_div = d3.select("select#division option:checked").text();
  // scope
  scope_across = d3.select("input#across").property("checked");
  scope = scope_across ? "across" : "within";
  // look for the person in the data
  this_person = [first_name, last_name, divisions.indexOf(selected_div) + 1].join("|");
  index_in_data = person_index.find(function (d) {
    return d.name === this_person;
  });
  if (index_in_data != null) {
    d3.select("div#chart").text(""); // clear text in div

    // if multiple records for that person: pick a random one?
    all_indices = person_index.filter(function (d) {
      return d.name === this_person;
    });
    if (all_indices.length > 1) {
      // pick a random one
      index_in_data = all_indices[Math.floor(Math.random() * all_indices.length)];
    }
    this_record = salaries[index_in_data.index];
    title = this_record.title;
    salary = this_record.AnnualSalary;
    target_jobcodes = jobcodes[title];
    salaries_subset = salaries.filter(function (d) {
      return target_jobcodes.indexOf(d.JobCode) >= 0;
    });
    if (scope === "within") {
      // subset by division
      plot_title = `\"${title}\" within ${selected_div}`;
      salaries_subset = salaries_subset.filter(function (d) {
        return d.Division === this_record.Division;
      });
    } else {
      plot_title = `\"${title}\" across campus`;
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
        results.push(d.FirstName + " " + d.LastName + " $" + d.AnnualSalary);
      }
      return results;
    }();
    // different color for the identified individual
    group = function () {
      var j, len, results;
      results = [];
      for (j = 0, len = salaries_subset.length; j < len; j++) {
        d = salaries_subset[j];
        results.push(2);
      }
      return results;
    }();
    this_index = function () {
      var results;
      results = [];
      for (i in salaries_subset) {
        if (salaries_subset[i].FirstName === first_name && salaries_subset[i].LastName === last_name) {
          results.push(i);
        }
      }
      return results;
    }();
    if (this_index >= 0) {
      group[this_index] = 1;
    }
    salary_range = salary_ranges[this_record.SalaryGrade];
    data_to_plot = {
      x: function () {
        var j, len, results;
        results = [];
        for (j = 0, len = comp_salaries.length; j < len; j++) {
          d = comp_salaries[j];
          results.push(1);
        }
        return results;
      }(),
      y: comp_salaries,
      indID: labels,
      group: group
    };
    data_to_plot.x.push(2);
    data_to_plot.y.push(salary);
    data_to_plot.indID.push(first_name + " " + last_name + " $" + salary);
    data_to_plot.group.push(1);
    ymin = d3.min(data_to_plot.y);
    if (salary_range.min !== "NA") {
      ymin = d3.min([ymin, salary_range.min]);
    }
    ymax = d3.max(data_to_plot.y);
    if (salary_range.max !== "NA") {
      ymax = d3.max([ymax, salary_range.max]);
    }
    mychart = d3panels.dotchart({
      xlab: "",
      ylab: "Annual Salary ($)",
      title: plot_title,
      height: 300,
      width: 800,
      ylim: [ymin * 0.95, ymax * 1.05],
      margin: {
        left: 120,
        top: 40,
        right: 120,
        bottom: 40,
        inner: 3
      },
      xcategories: [1, 2],
      xcatlabels: ["everyone", "you"],
      horizontal: true
    });
    mychart(d3.select("div#chart"), data_to_plot);
    mychart.points().on("mouseover", function (d) {
      return d3.select(this).attr("r", 6);
    }).on("mouseout", function (d) {
      return d3.select(this).attr("r", 3);
    });
    summary = five_number_summary(comp_salaries);
    g = d3.select("div#chart svg").append("g").attr("id", "boxplot");
    y1 = mychart.yscale()(1);
    y2 = mychart.yscale()(2);
    ym = (y1 + y2) / 2;
    green = "#2ECC40";
    orange = "#FF851B";
    g.append("line").attr("x1", mychart.xscale()(summary[0])).attr("x2", mychart.xscale()(summary[1])).attr("y1", ym).attr("y2", ym).style("stroke-width", 3).style("stroke", green);
    g.append("line").attr("x1", mychart.xscale()(summary[3])).attr("x2", mychart.xscale()(summary[4])).attr("y1", ym).attr("y2", ym).style("stroke-width", 3).style("stroke", green);
    g.append("line").attr("x1", mychart.xscale()(summary[1])).attr("x2", mychart.xscale()(summary[3])).attr("y1", ym * 0.75 + y2 * 0.25).attr("y2", ym * 0.75 + y2 * 0.25).style("stroke-width", 3).style("stroke", green);
    g.append("line").attr("x1", mychart.xscale()(summary[3])).attr("x2", mychart.xscale()(summary[1])).attr("y1", ym * 0.75 + y1 * 0.25).attr("y2", ym * 0.75 + y1 * 0.25).style("stroke-width", 3).style("stroke", green);
    vert_line_labels = ["min", "25th %ile", "median", "75th %ile", "max"];
    vert_lines = g.append("g").selectAll("empty").data(summary).enter().append("line").style("stroke-width", 3).style("stroke", green).attr("x1", function (d) {
      return mychart.xscale()(d);
    }).attr("x2", function (d) {
      return mychart.xscale()(d);
    }).attr("y1", function (d, i) {
      if (i === 0 || i === 4) {
        return ym * 0.9 + y2 * 0.1;
      } else {
        return ym * 0.75 + y2 * 0.25;
      }
    }).attr("y2", function (d, i) {
      if (i === 0 || i === 4) {
        return ym * 0.9 + y1 * 0.1;
      } else {
        return ym * 0.75 + y1 * 0.25;
      }
    });
    // add tool tip
    vert_lines_tooltip = d3panels.tooltip_create(d3.select("body"), vert_lines, {
      tipclass: "tooltip"
    }, function (d, i) {
      return `${vert_line_labels[i]} = $${Math.round(d)}`;
    });
    g_range = d3.select("div#chart svg").append("g").attr("id", "salary_range");
    range_min = salary_range.min === "NA" ? summary[0] : salary_range.min;
    range_max = salary_range.max === "NA" ? summary[4] : salary_range.max;
    g_range.append("line").style("stroke-width", 3).style("stroke", orange).attr("x1", function (d) {
      return mychart.xscale()(range_min);
    }).attr("x2", function (d) {
      return mychart.xscale()(range_max);
    }).attr("y1", 2 * y2 - (ym * 0.4 + y2 * 0.6)).attr("y2", 2 * y2 - (ym * 0.4 + y2 * 0.6));
    range = [range_min, range_max];
    sr_range = [salary_range.min, salary_range.max];
    ref = [0, 1];
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      val = range[i];
      if (sr_range[i] !== "NA") {
        g_range.append("line").style("stroke-width", 3).style("stroke", orange).attr("x1", mychart.xscale()(val)).attr("x2", mychart.xscale()(val)).attr("y1", 2 * y2 - (ym * 0.4 + y2 * 0.6 + (y2 - y1) * 0.05)).attr("y2", 2 * y2 - (ym * 0.4 + y2 * 0.6 - (y2 - y1) * 0.05));
      } else {
        g_range.append("line").style("stroke-width", 3).style("stroke", orange).attr("x1", mychart.xscale()(val)).attr("x2", mychart.xscale()(val) + (1 - i * 2) * (y2 - y1) * 0.1).attr("y1", 2 * y2 - (ym * 0.4 + y2 * 0.6)).attr("y2", 2 * y2 - (ym * 0.4 + y2 * 0.6 - (y2 - y1) * 0.05));
        g_range.append("line").style("stroke-width", 3).style("stroke", orange).attr("x1", mychart.xscale()(val)).attr("x2", mychart.xscale()(val) + (1 - i * 2) * (y2 - y1) * 0.1).attr("y1", 2 * y2 - (ym * 0.4 + y2 * 0.6)).attr("y2", 2 * y2 - (ym * 0.4 + y2 * 0.6 + (y2 - y1) * 0.05));
      }
    }
    // min and max salary for title
    if (salary_range.min === "NA") {
      start_range_text = "There is no minimum salary for your title;";
    } else {
      start_range_text = `The minimum salary for your title is $${salary_range.min};`;
    }
    if (salary_range.max === "NA") {
      end_range_text = " there is no maximum salary for your title.";
    } else {
      end_range_text = ` the maximum salary for your title is $${salary_range.max}.`;
    }
    if (salary_range.min === "NA" && salary_range.max === "NA") {
      range_text = "Your title has neither a minimum nor maximum salary.";
    } else {
      range_text = start_range_text + end_range_text;
    }
    return d3.select("div#text_output").html(`<p>Your title is ${title} in ${this_record.Department}, ${selected_div}. ` + `Your annual salary (adjusted for FTE) is $${salary}. ` + range_text + "<p>On top, the plot shows the actual salaries of all other employees (blue dots) " + "that have the same job title as you. " + "The green box represents the range from the 25th to 75th percentile; " + "the central green line is the median. " + "The orange line indicates the salary range for your title;" + "arrowheads on the left or right indicate no minimum or maximum salary, respectively." + "<p>You can either compare salaries in the same title across campus or " + "only within your school/division.");
  } else {
    return d3.select("div#chart").text(`${first_name} ${last_name} not found in ${selected_div}`); // individual was found
  }
};

// calculate min, 25 %ile, median, 75 %ile, max
five_number_summary = function (x) {
  var above, below, lower, max, median, min, n, quarter, upper, weight1, weight2, xv;
  if (x == null) {
    return null;
  }
  // drop missing values
  x = function () {
    var j, len, results;
    results = [];
    for (j = 0, len = x.length; j < len; j++) {
      xv = x[j];
      if (xv != null) {
        results.push(xv);
      }
    }
    return results;
  }();
  n = x.length;
  if (!(n > 0)) {
    return null;
  }
  if (!(n > 1)) {
    return [x[0], x[0], x[0], x[0], x[0]];
  }
  x.sort(function (a, b) {
    return a - b;
  });
  if (n % 2 === 1) {
    median = x[(n - 1) / 2];
  } else {
    median = (x[n / 2] + x[n / 2 - 1]) / 2;
  }
  min = x[0];
  max = x[n - 1];
  // calculate lower and upper quartile
  quarter = (n - 1) * 0.25;
  below = Math.floor(quarter);
  above = Math.ceil(quarter);
  weight1 = quarter - below;
  weight2 = 1 - weight1;
  lower = x[below] * weight2 + x[below + 1] * weight1;
  upper = x[n - below - 2] * weight1 + x[n - below - 1] * weight2;
  return [min, lower, median, upper, max];
};