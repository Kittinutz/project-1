export const separatePoint = (nodes, n) => {
  // nodes [] = [1 (index 0 ),2,3]
  // node = [] = [{latitude , longtitude}]
  let xMax = 0;
  let xMin = 0;
  let yMax = 0;
  let yMin = 0;
  // latitude = x
  // longtitude = y
  for (let i = 0; i < nodes.length; i++) {
    const { latitude, longtitude } = nodes[i];

    if (i === 0) {
      xMin = latitude;
      yMin = longtitude;
    }

    if (latitude > xMax) {
      xMax = latitude;
    }

    if (longtitude > yMax) {
      yMax = longtitude;
    }

    if (latitude < xMin) {
      xMin = latitude;
    }

    if (longtitude < yMin) {
      yMin = longtitude;
    }
  }
  return findInterSection({
    xMax,
    xMin,
    yMax,
    yMin,
    n,
  });
};

export const findInterSection = ({ xMax, xMin, yMax, yMin, n }) => {
  let center = [];
  //   0,0 0,1 1,0 1,1
  console.log((xMax + xMin) / n);

  for (let x = 0; x < n - 1; x++) {
    let centerX = xMin + ((xMax - xMin) / n) * (x + 1);

    for (let y = 0; y < n - 1; y++) {
      let centerY = yMin + ((yMax - yMin) / n) * (y + 1);
      center.push({
        centerX,
        centerY,
      });
    }
  }
  return center;
};

export const findZone = (nodes, centers, separateNumber) => {
  const zone = {
    0: [],
    1: [],
    2: [],
    3: [],
  };
  const totalZone = Math.pow(separateNumber, 2);

  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      const { latitude, longtitude } = nodes[j];
    }
  }
};
