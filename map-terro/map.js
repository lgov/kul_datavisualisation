var allData = new Array();
var prevalenceData = new Array();
var countryData = new Array();

var currentYear = document.getElementById('year-select').value;
var terrorType = document.getElementById('terror-select').value;

// var colors = d3.scale.category10();
var colors = d3.scale.linear().domain([1,10])
    .range(["white", "red"])

var color = d3.scale.linear()
			  .range(["808080", "#ffe3e3","#ffaaaa","#ff7171","#ff3939", "#ff0000"]);

var legendText = ["No data", "0 < Value < 50", "50 < Value < 200", "200 < Value < 500", "500 < Value < 1000", "1000 < Value"];

function makeColor(percentage) {
    if (percentage >= 0 && percentage < 50) {
        return colors(2);
    }
    else if (percentage >= 50 && percentage < 200) {
        return colors(4);
    }
    else if (percentage >= 200 && percentage < 500) {
        return colors(6);
    }
    else if (percentage >= 500 && percentage < 1000) {
        return colors(8);
    }
    else if (percentage >= 1000) {
        return colors(10);
    }
}

function getUnique(array) {
    var uniqueArray = [];
    var resultArray = [];
    // Loop through array values
    for(i=0; i < array.length; i++){
        if(uniqueArray.indexOf(array[i]) === -1) {
            uniqueArray.push(array[i]);
        }
    }
    for(j=0; j < uniqueArray.length; j++){
       var data = {"country": uniqueArray[j], "country_code": '', "attack": 0, "victim": 0, "killed": 0};
       resultArray.push(data);
    }
    return resultArray;
}

function calcTotal(arr, year) {
    prevalenceData = [];

    var yearData = new Array();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].iyear == year) {
            yearData.push(arr[i]);
            prevalenceData.push(arr[i].country_txt);
        }
    }

    prevalenceData = getUnique(prevalenceData);

    for (var k = 0; k < prevalenceData.length; k++) {
        for (var j = 0; j < yearData.length; j++) {
            if(yearData[j].country_txt == prevalenceData[k].country) {
                prevalenceData[k].attack ++;
                prevalenceData[k].victim += yearData[j].nwound * 1;
                prevalenceData[k].killed += yearData[j].nkill * 1;
            }
        }
        for (var n = 0; n < countryData.length; n++) {
            if( prevalenceData[k].country == countryData[n].name) {
                prevalenceData[k].country_code = countryData[n].code;
            }
        }
    }
}

function setCountries(arr, year, terror) {
    calcTotal(arr, year);
    for (var i = 0; i < prevalenceData.length; i++) {
        var selectedGeo = {};
        var percentage = prevalenceData[i][terror];
        selectedGeo[prevalenceData[i].country_code] = makeColor(percentage);
        map.updateChoropleth(selectedGeo);
    }
}

function getValue(code) {
    for(var i = 0; i < prevalenceData.length; i++) {
        if(code == prevalenceData[i].country_code) {
            return prevalenceData[i][terrorType];
        } 
    }
}

function tooltipHtml(n, code) {	/* function to create html content string in tooltip div. */
    return "<h4>"+n+"</h4><table>"+
    "<tr><td>"+getValue(code)+"</td></tr>"+
    "</table>";
}

var map = new Datamap({
    element: document.getElementById("worldmap"),
    projection: 'mercator',
    fills: {
        defaultFill: "#808080",
    },
    height: 900,
    done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('mouseover', function (geography) {
            d3.select("#tooltip").transition().duration(200).style("opacity", .9);      
			d3.select("#tooltip").html(tooltipHtml(geography.properties.name, geography.id))  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY) + "px");
        })
        .on('click', function(geography) {
            alert(geography.properties.name);
        });
    },
})

color.domain([0,1,2,3,4,5]);

var legend = d3.select("#legend-box").append("svg")
            .attr("class", "legend")
            .attr("width", 200)
            .attr("height", 200)
            .selectAll("g")
            .data(color.domain().slice())
            .enter()
            .append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

legend.append("text")
        .data(legendText)
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });

map.svg.call(d3.behavior.zoom().on('zoom', function () {
     map.svg.selectAll('g').attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')')
}));

d3.json("data/countries.json", function (data) {
    for (var i = 0; i < data.length; i++) {
        countryData.push(data[i]);
    }
});

d3.csv("data/globalterrorismdb_0221dist.csv", function (data) {
    for (var i = 0; i < data.length; i++) {
        allData.push(data[i]);
    }
    calcTotal(allData, currentYear);
    setCountries(allData, currentYear, terrorType);
});

$(function() {
    $("#year-select").change(function (event) {
        year = event.target.value;
        currentYear = year;
        setCountries(allData, year, terrorType);
        document.getElementById("year-val").innerHTML = "Current Year: " + year;
    })
    $("#terror-select").change(function (event) {
        terror = event.target.value;
        terrorType = terror;
        setCountries(allData, currentYear, terrorType);
    })
});