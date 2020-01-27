import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import memoize from 'fast-memoize';
import { calCulateAttitude } from '../Utils/calBestAttitude';
import Loader from 'react-loader-spinner';
import { connect } from 'react-redux';
import { getAllNode } from '../actions';
import * as XLSX from 'xlsx';
import getXYZ from '../Utils/getXYZ';
import getStatError, { getAllErrorModel } from '../Utils/getStatError';
import computePredict from '../Utils/computePredict';
import createScatterGraph from '../Utils/createScatterGraph';

const memoizeCalCulateAttitude = memoize(calCulateAttitude);
class Form extends Component {
  state = {
    nodes: [{ id: 1, latitude: '', longtitude: '', attitude: '' }],
    x: [],
    y: [],
    z: [],
    loading: false
  };
  addNode = () => {
    const { nodes } = this.state;
    const id = nodes.length + 1;
    this.setState({
      nodes: [
        ...nodes,
        {
          id: id,
          latitude: '',
          longtitude: '',
          attitude: ''
        }
      ]
    });
  };
  onChangeFile = e => {
    const file = e.target.files[0];
    var name = file.name;
    const reader = new FileReader();
    let dataRetrive;
    reader.onload = evt => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      /* Update state */
      data.shift();
      const transformDataNode = data.reduce((array, next, index) => {
        return [
          ...array,
          {
            id: index + 1,
            latitude: next[0], //x
            longtitude: next[1], //y
            attitude: next[2], //z
            predictAttitude: next[3] //p
          }
        ];
      }, []);
      this.setState({
        nodes: transformDataNode
      });
    };
    reader.readAsBinaryString(file);
  };
  onChangeNode = e => {
    const { nodes } = this.state;
    const { id, name, value } = e.target;
    const temp = nodes;
    temp[id - 1][name] = value;
    this.setState({
      nodes: temp
    });
  };
  deleteNodes = e => {
    const { nodes } = this.state;
    const { id } = e.target;
    const nodeIdTarget = parseInt(id);
    const updateDeleteNode = nodes.filter(({ id }) => id !== nodeIdTarget);
    this.setState({
      nodes: updateDeleteNode
    });
  };

  onSubmit = () => {
    const { nodes, loading } = this.state;
    this.setState({
      loading: !loading
    });
    setTimeout(() => {
      const {
        bestSum,
        allRangeOfNodes,
        semiVarioGram
      } = memoizeCalCulateAttitude(nodes);

      let newNodesWithLastAttitude = nodes;

      this.setState({
        lastPredictNode: bestSum,
        allRangeOfNodes,
        nodes: newNodesWithLastAttitude,
        semiVarioGram,
        loading: false
      });
    }, 500);
  };
  handleChangeModel = e => {
    const value = e.target.value;
    this.setState({
      model: value
    });
  };
  render() {
    const {
      nodes,
      loading,
      lastPredictNode = false,
      allRangeOfNodes,
      semiVarioGram,
      model = 'exponential'
    } = this.state;
    const transformDataNode = lastPredictNode
      ? computePredict(lastPredictNode[model], nodes)
      : nodes;

    const scatterGraph = lastPredictNode
      ? createScatterGraph(allRangeOfNodes, semiVarioGram, model)
      : false;
    const x = getXYZ(transformDataNode, 'latitude');
    const y = getXYZ(transformDataNode, 'longtitude');
    const z = getXYZ(transformDataNode, 'attitude');
    const error = lastPredictNode
      ? getAllErrorModel(nodes, lastPredictNode)
      : false;

    return (
      <div className="container-graph">
        {loading && (
          <div className="modal">
            <Loader type="Puff" color="#00BFFF" height="100" width="100" />
          </div>
        )}

        <div style={{ margin: '15px' }}>
          <h1>{model || 'exponential'}</h1>
          <div>
            <h1>select model</h1>
            <button onClick={this.handleChangeModel} value="exponential">
              Exponential Model
            </button>
            <button onClick={this.handleChangeModel} value="linear">
              Linear Model
            </button>
            <button onClick={this.handleChangeModel} value="spherical">
              Spherical Model
            </button>
            <button onClick={this.handleChangeModel} value="pentaspherical">
              Pentaschericle Model
            </button>
            <button onClick={this.handleChangeModel} value="gaussian">
              Gussian Model
            </button>
          </div>
          <h1>FORM NODE LIST</h1>
          <div className="input-node-title">
            <p className="node-p-id">ID</p>
            <p className="node-unit">Latitude</p>
            <p className="node-unit">Longtitude</p>
            <p className="node-unit">Attitude</p>
            <p className="node-unit">Predict Attitude</p>
          </div>
          {transformDataNode.map(
            ({ id, latitude, longtitude, attitude, predictAttitude }) => (
              <div key={id + latitude.toString()} className="input-node">
                <div className="id-node">
                  <p>{id}</p>
                </div>
                <div>
                  <input
                    onChange={this.onChangeNode}
                    id={id}
                    name="latitude"
                    value={latitude || ''}
                  ></input>
                </div>
                <div>
                  <input
                    onChange={this.onChangeNode}
                    id={id}
                    name="longtitude"
                    value={longtitude || ''}
                  ></input>
                </div>
                <div>
                  <input
                    onChange={this.onChangeNode}
                    id={id}
                    name="attitude"
                    value={attitude || ''}
                  ></input>
                </div>
                <div>
                  <input
                    onChange={this.onChangeNode}
                    id={id}
                    name="predictAttitude"
                    value={predictAttitude || ''}
                  ></input>
                </div>
                <div>
                  <button id={id} onClick={this.deleteNodes}>
                    Delete
                  </button>
                </div>
              </div>
            )
          )}

          <input onChange={this.onChangeFile} type="file"></input>
          <button onClick={this.addNode}>ADD NODE</button>
          <button onClick={this.onSubmit}>Submit</button>
        </div>

        <div className="graph">
          {error && (
            <div>
              <table>
                <thead>
                  <th>Model</th>
                  <th>Mean Error</th>
                  <th>Mean of Percentage Error</th>
                  <th>Mean Absolute Error</th>
                  <th>Mean Squre Error</th>
                  <th>Root Mean Squre Error</th>
                </thead>
                <tbody style={{ textAlign: 'center' }}>
                  <tr>
                    <td>Exponential</td>
                    <td>{error['exponential'].meanError}</td>
                    <td>{error['exponential'].meanOfPercentageError}</td>
                    <td>{error['exponential'].meanAbsoluteError}</td>
                    <td>{error['exponential'].meanSquareError}</td>
                    <td>{error['exponential'].rootMeanSquareError}</td>
                  </tr>
                  <tr>
                    <td>Linear</td>
                    <td>{error['linear'].meanError}</td>
                    <td>{error['linear'].meanOfPercentageError}</td>
                    <td>{error['linear'].meanAbsoluteError}</td>
                    <td>{error['linear'].meanSquareError}</td>
                    <td>{error['linear'].rootMeanSquareError}</td>
                  </tr>
                  <tr>
                    <td>Spherical</td>
                    <td>{error['sherical'].meanError}</td>
                    <td>{error['sherical'].meanOfPercentageError}</td>
                    <td>{error['sherical'].meanAbsoluteError}</td>
                    <td>{error['sherical'].meanSquareError}</td>
                    <td>{error['sherical'].rootMeanSquareError}</td>
                  </tr>
                  <tr>
                    <td>Pentaschericle</td>
                    <td>{error['pentaspherical'].meanError}</td>
                    <td>{error['pentaspherical'].meanOfPercentageError}</td>
                    <td>{error['pentaspherical'].meanAbsoluteError}</td>
                    <td>{error['pentaspherical'].meanSquareError}</td>
                    <td>{error['pentaspherical'].rootMeanSquareError}</td>
                  </tr>
                  <tr>
                    <td>Guassian</td>
                    <td>{error['gaussian'].meanError}</td>
                    <td>{error['gaussian'].meanOfPercentageError}</td>
                    <td>{error['gaussian'].meanAbsoluteError}</td>
                    <td>{error['gaussian'].meanSquareError}</td>
                    <td>{error['gaussian'].rootMeanSquareError}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {scatterGraph && (
            <Plot
              data={scatterGraph}
              layout={{
                width: 900,
                height: 600,
                title: 'Semivariogram Analysis',
                xaxis: {
                  title: 'Distance'
                },
                yaxis: {
                  title: 'Semivariogram'
                }
              }}
            />
          )}
          {lastPredictNode ? (
            <Plot
              data={[
                {
                  x: x,
                  y: y,
                  z: z,
                  type: 'mesh3d'
                  // intensity: [0, 0.33, 0.66, 10000000],
                  // colorscale: [
                  //     [0, 'rgb(255, 0, 0)'],
                  //     [0.5, 'rgb(0, 255, 0)'],
                  //     [10000000, 'rgb(0, 0, 255)']
                  // ]
                }
              ]}
              layout={{ width: 900, height: 600, title: '3D Surface Plots' }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default Form;
