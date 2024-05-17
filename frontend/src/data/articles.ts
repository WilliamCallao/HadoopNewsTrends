import type { Article } from '../interfaces'

const sources = ['Los tiempos', 'La razon', 'El deber']

export const articlesData: Article[] = new Array(20).fill('').map((_, idx) => ({
  id: crypto.randomUUID(),
  title: `Artículo #${idx + 1}`,
  content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc faucibus quam ac sagittis efficitur. Nulla a tortor non mauris lobortis sodales eget eget lorem. Suspendisse at elit sed lacus vehicula efficitur. Integer feugiat gravida risus, eget porttitor turpis maximus nec. Vivamus quis condimentum arcu. Donec pulvinar, sem ut dictum finibus, nisi risus dictum libero, in dapibus lacus enim at orci. Ut sed nibh vestibulum, consequat quam malesuada, sollicitudin diam. Aliquam vulputate turpis eu magna dictum pretium. Suspendisse potenti. Quisque faucibus, felis et aliquam semper, mauris nunc aliquet est, ut dignissim felis massa consequat mauris. Cras elementum facilisis laoreet. Duis rutrum lectus a mauris sodales feugiat. Suspendisse sit amet varius tellus.

Morbi non odio non ante convallis dictum. Vivamus placerat convallis erat a ullamcorper. Maecenas ornare vestibulum dui in consequat. Curabitur mollis elit sed augue pretium pretium. Proin nisi libero, porttitor id tristique a, aliquam id lacus. Nulla eleifend turpis at erat consequat accumsan. Sed finibus faucibus pulvinar. Sed id eros ac ipsum accumsan placerat nec non erat. Quisque faucibus lorem sed scelerisque aliquam. Etiam eros lorem, volutpat sed ultrices sit amet, convallis eu magna. Fusce ac gravida velit, in consequat orci. Phasellus viverra ultricies lectus in ornare. Nullam porta feugiat magna, in semper elit semper nec. Fusce elementum ligula dui, ut hendrerit enim feugiat vitae.

Cras metus felis, dictum et vehicula ut, dictum ac nisi. In ut nibh a libero tincidunt hendrerit eget ac mi. Vivamus quis convallis leo, eget maximus nisi. Cras enim sapien, varius in mattis id, volutpat in augue. Etiam quis turpis in est ultricies varius laoreet in est. Nullam facilisis nisl urna. Ut blandit finibus nisi, sit amet pellentesque arcu elementum at. Quisque et augue lobortis, sollicitudin purus in, lobortis lacus. Praesent vel pharetra libero. Integer tempus ex nec ornare accumsan. Praesent dui erat, feugiat et finibus ut, porttitor sed ligula.
`,
  date: new Date().toISOString(),
  source: sources[Math.floor(Math.random() * sources.length)],
}))
