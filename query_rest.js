const project = 'ai-studio-urbanozeiro-675f17be-1d5e-4948-8a36-ce5490765ddc';
async function run() {
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/segments`);
  const data = await res.json();
  console.log("Segments:", JSON.stringify(data, null, 2));

  const res2 = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/zones`);
  const data2 = await res2.json();
  console.log("Zones count:", data2.documents ? data2.documents.length : 0);
  const segmentsInZones = (data2.documents || []).filter(d => {
      const shape = d.fields.shape;
      return shape && shape.stringValue === 'segment';
  });
  console.log("Segments in Zones count:", segmentsInZones.length);
}
run();
