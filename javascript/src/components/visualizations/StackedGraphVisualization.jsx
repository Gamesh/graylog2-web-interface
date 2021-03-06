/* global graphHelper, momentHelper */

'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Immutable = require('immutable');
var numeral = require('numeral');
var c3 = require('c3');
var d3 = require('d3');

var D3Utils = require('../../util/D3Utils');
var NumberUtils = require('../../util/NumberUtils');

var StackedGraphVisualization = React.createClass({
    getInitialState() {
        this.normalizedData = false;
        this.series = Immutable.List();
        this.seriesNames = Immutable.Map();
        this.barWidthScale = d3.scale.linear().domain(d3.range(0, 10000)).range(d3.range(0.6, 0, -0.01));

        return {
            dataPoints: Immutable.Set()
        };
    },
    componentDidMount() {
        this.renderGraph();
        this.setState({dataPoints: this._formatData(this.props.data)}, this.drawData);

    },
    componentWillReceiveProps(nextProps) {
        this.normalizedData = false;
        if (nextProps.height !== this.props.height || nextProps.width !== this.props.width) {
            this._resizeVisualization(nextProps.width, nextProps.height);
        }
        this._updateSeriesNames();
        this.setState({dataPoints: this._formatData(nextProps.data)}, this.drawData);
    },
    _normalizeData(data) {
        if (this.normalizedData || data === null || data === undefined || !Array.isArray(data)) {
            return;
        }
        this.normalizedData = true;

        return data.map((dataPoint) => {
            dataPoint.y = NumberUtils.normalizeGraphNumber(dataPoint.y);
            return dataPoint;
        });
    },
    _formatData(data) {
        var normalizedData = this._normalizeData(data);
        var series = Immutable.Map();

        normalizedData.forEach((dataPoint) => {
            var timestamp = dataPoint.x * 1000;
            var formattedDataPoint = Immutable.Map({ timestamp: timestamp }).set("series" + dataPoint.series, dataPoint.y);
            if (series.has(timestamp)) {
                series = series.set(timestamp, series.get(timestamp).merge(formattedDataPoint));
            } else {
                series = series.set(timestamp, formattedDataPoint);
            }
        }, this);

        return series.toOrderedSet().sortBy((dataPoint) => dataPoint.get('timestamp'));
    },
    _getGraphType() {
        var graphType;

        switch (this.props.config.renderer) {
            case 'scatterplot':
                graphType = 'scatter';
            break;
            case 'line':
                graphType = (this.props.config.interpolation !== 'step-after') ? 'spline' : 'step';
                break;
            case 'area':
                graphType = (this.props.config.interpolation !== 'step-after') ? 'area-spline' : 'area-step';
                break;
            default:
                graphType = this.props.config.renderer;
        }

        return graphType;
    },
    _applyGraphConfiguration(graphType) {
        switch (graphType) {
            case 'bar':
                // Automatically resize bar width
                var numberDataPoints = this.state.dataPoints.size;
                this.graph.internal.config.bar_width_ratio = Math.max(0.015, this.barWidthScale(numberDataPoints));
                break;
            case 'spline':
            case 'area-spline':
                this.graph.internal.config.spline_interpolation_type = this.props.config.interpolation;
                break;
            case 'step':
            case 'area-step':
                this.graph.internal.config.line_step_type = this.props.config.interpolation;
                break;
        }
    },
    renderGraph() {
        var graphDomNode = ReactDOM.findDOMNode(this);
        var colourPalette = D3Utils.glColourPalette();

        var i = 0;
        var colours = Immutable.Map();

        this.props.config.series.forEach((seriesConfig) => {
            i++;
            var seriesName = "series" + i;
            this.series = this.series.push(seriesName);
            this.seriesNames = this.seriesNames.set(seriesName, seriesConfig['statistical_function'] + " " + seriesConfig['field'] + ", \"" + seriesConfig['query'] + "\"");
            colours = colours.set(seriesName, colourPalette(seriesName));
        });

        this.yAxisFormatter = (value) => {
            return Math.abs(value) > 1e+30 || value === 0 ? value.toPrecision(1) : d3.format(".2s")(value);
        };

        this.graph = c3.generate({
            bindto: graphDomNode,
            size: {
                height: this.props.height,
                width: this.props.width
            },
            data: {
                columns: [],
                names: this.seriesNames.toJS(),
                colors: colours.toJS()
            },
            padding: {
                right: 10
            },
            axis: {
                x: {
                    type: 'timeseries',
                    label: {
                        text: 'Time',
                        position: 'outer-center'
                    },
                    tick: {
                        format: graphHelper.customDateTimeFormat()
                    }
                },
                y: {
                    label: {
                        text: 'Values',
                        position: 'outer-middle'
                    },
                    tick: {
                        count: 3,
                        format: this.yAxisFormatter
                    },
                    padding: {
                        bottom: 0
                    }
                }
            },
            grid: {
                y: {
                    show: true,
                    ticks: 3
                },
                focus: {
                    show: false
                }
            },
            tooltip: {
                format: {
                    title: this._formatTooltipTitle,
                    value: this._formatTooltipValue
                }
            }
        });
    },
    _formatTooltipTitle(x) {
        return momentHelper.toUserTimeZone(x).format(momentHelper.HUMAN_TZ);
    },
    _formatTooltipValue(value, ratio, id, index) {
        var formattedValue;
        try {
            formattedValue = numeral(value).format("0,0.[00]");
        } catch (e) {
            formattedValue = d3.format(".2r")(value);
        }

        return formattedValue;
    },
    _resizeVisualization(width, height) {
        this.graph.resize({
            width: width,
            height: height
        });
    },
    _updateSeriesNames() {
        var i = 0;
        var newSeriesNames = Immutable.Map();
        this.props.config.series.forEach((seriesConfig) => {
            i++;
            var seriesName = "series" + i;
            newSeriesNames = newSeriesNames.set(seriesName, seriesConfig['statistical_function'] + " " + seriesConfig['field'] + ", \"" + seriesConfig['query'] + "\"");
        }, this);

        if (!Immutable.is(this.seriesNames, newSeriesNames)) {
            this.seriesNames = newSeriesNames;
            this.graph.data.names(this.seriesNames.toJS());
        }
    },
    drawData() {
        var graphType = this._getGraphType();
        this._applyGraphConfiguration(graphType);

        // Generate custom tick values for the time axis
        this.graph.internal.config.axis_x_tick_values = graphHelper.customTickInterval()(
            this.state.dataPoints.first().get('timestamp') - 1000,
            this.state.dataPoints.last().get('timestamp') + 1000
        );

        this.graph.load({
            json: this.state.dataPoints.toJS(),
            keys: {
                x: 'timestamp',
                value: this.series.toJS()
            },
            type: graphType
        });
    },
    render() {
        return (
            <div id={"visualization-" + this.props.id} className={"graph " + this.props.config.renderer}/>
        );
    }
});

module.exports = StackedGraphVisualization;