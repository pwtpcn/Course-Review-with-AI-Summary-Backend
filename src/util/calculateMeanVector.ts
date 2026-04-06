export function calculateMeanVector(vectors: number[][]): number[] {
  if (!vectors || vectors.length === 0) {
    throw new Error("Vectors array is empty or undefined");
  }

  const vectorCount = vectors.length;
  const vectorLength = vectors[0].length;

  //Array สำหรับเก็บผลรวม เริ่มต้นด้วย 0 ทุกมิติ
  const sumVector = new Array(vectorLength).fill(0);

  //บวกค่าในแต่ละมิติของทุก Vector เข้าด้วยกัน
  for (const vec of vectors) {
    for (let i = 0; i < vectorLength; i++) {
      sumVector[i] += vec[i];
    }
  }

  return sumVector.map((val) => val / vectorCount);
}
