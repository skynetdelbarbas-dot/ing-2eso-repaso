// ============================================================
// POOL CENTRAL — Writing, Reading, Listening (10 ejercicios c/u)
// ============================================================

// ===================== WRITING =====================
// keywords: palabras requeridas (el alumno debe usarlas)
// bonus: palabras extra que suman puntos
// trapWords: españolismos a detectar
// model: respuesta modelo de referencia

const WRITING_POOL = [
  {
    id: 'w1',
    title: 'Describe your bedroom',
    prompt: 'Describe your bedroom. Say where things are, what colour they are, and what you like about it. Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['bed', 'desk', 'window'],
    bonus: ['small', 'big', 'cozy', 'blue', 'lamp', 'cupboard', 'pictures', 'quiet'],
    trapWords: ['hacer', 'cosa', 'utilice', 'porque', 'mucho'],
    model: 'My bedroom is small but cozy. There is a bed next to the window. I have a desk where I do my homework. A blue lamp is on the desk. I love my bedroom because it is quiet.'
  },
  {
    id: 'w2',
    title: 'Email to a friend about your holiday',
    prompt: 'Write an email to your English friend Alex. Tell him/her about your last holiday: where you went, who with, and what you did. Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['holiday', 'went', 'did'],
    bonus: ['beach', 'hotel', 'family', 'swim', 'visited', 'museum', 'beautiful', 'weather'],
    trapWords: ['hacer', 'fuí', 'estuve', 'vacaciones'],
    model: 'Hi Alex, How are you? I went on holiday to the beach last month with my family. I swam every day and visited a museum. The weather was beautiful. We stayed in a nice hotel. I hope you are well. Write back soon! Love, [Name]'
  },
  {
    id: 'w3',
    title: 'Describe your best friend',
    prompt: 'Describe your best friend. What is his/her name? What does he/she look like? Why do you like him/her? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['friend', 'name', 'like'],
    bonus: ['tall', 'funny', 'clever', 'hair', 'eyes', 'kind', 'help', 'laugh'],
    trapWords: ['hacer', 'amigo', 'mucho', 'gusta'],
    model: 'My best friend is called Marta. She is tall with long brown hair and blue eyes. She is very funny and clever. I like her because she always helps me with my homework. We laugh a lot together.'
  },
  {
    id: 'w4',
    title: 'My daily routine',
    prompt: 'Describe a typical day in your life. What time do you wake up? What do you do in the morning, afternoon and evening? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['wake', 'school', 'evening'],
    bonus: ['breakfast', 'lunch', 'homework', 'bed', 'walk', 'brush', 'shower', 'dinner'],
    trapWords: ['hacer', 'desayuno', 'ceno', 'casa'],
    model: 'I wake up at seven o\'clock. I have breakfast and brush my teeth. I go to school at eight. In the afternoon I do my homework and play football. In the evening I have dinner with my family and watch TV. I go to bed at ten.'
  },
  {
    id: 'w5',
    title: 'My favourite food',
    prompt: 'Describe your favourite food or meal. What is it? When do you eat it? Who makes it? Why do you like it? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['favourite', 'eat', 'like because'],
    bonus: ['pizza', 'pasta', 'rice', 'delicious', 'mum', 'grandma', 'spicy', 'sweet'],
    trapWords: ['hacer', 'comida', 'rico', 'muy'],
    model: 'My favourite food is pizza. I eat it every Friday with my family. My mum makes it with cheese, tomato and ham. It is delicious and I love it because we eat together and talk about the week.'
  },
  {
    id: 'w6',
    title: 'A funny day',
    prompt: 'Write about a funny or surprising day you had. What happened? Where were you? Who was with you? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['day', 'happened', 'laughed'],
    bonus: ['funny', 'surprising', 'park', 'friend', 'fell', 'joke', 'silly', 'remember'],
    trapWords: ['hacer', 'día', 'pasó', 'gracioso'],
    model: 'Last Saturday I went to the park with my friend Tom. He tried to do a cartwheel and fell into a puddle! We both laughed so much. It was a funny day and I will always remember it.'
  },
  {
    id: 'w7',
    title: 'Describe your house',
    prompt: 'Describe the house or flat where you live. How many rooms? What is your favourite room and why? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['rooms', 'living', 'bedroom'],
    bonus: ['kitchen', 'garden', 'bathroom', 'floor', 'stairs', 'comfortable', 'light', 'big'],
    trapWords: ['hacer', 'casa', 'tiene', 'habitaciones'],
    model: 'I live in a flat with three bedrooms and a big living room. My favourite room is the living room because there is a large window and it is very light. We have a small kitchen and a bathroom too.'
  },
  {
    id: 'w8',
    title: 'My last birthday',
    prompt: 'Write about your last birthday. How old were you? What did you do? Who was there? What presents did you get? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['birthday', 'party', 'present'],
    bonus: ['cake', 'candles', 'friends', 'family', 'balloons', 'sang', 'danced', 'fun'],
    trapWords: ['hacer', 'cumpleaños', 'fiesta', 'regalo'],
    model: 'My last birthday was great. I was thirteen and I had a party at home. My friends came and we played games. My mum made a big chocolate cake. I got a book and a new video game as presents. It was so much fun.'
  },
  {
    id: 'w9',
    title: 'Describe a photo',
    prompt: 'Describe a photo you like. What is in the photo? Where was it taken? Who is in it? Why do you like it? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['photo', 'people', 'background'],
    bonus: ['smiling', 'sunny', 'beach', 'family', 'holiday', 'remember', 'beautiful', 'colour'],
    trapWords: ['hacer', 'foto', 'gusta', 'personas'],
    model: 'I like a photo from our holiday last year. It shows my family on the beach. My sister is smiling and my mum and dad are building a sandcastle. The sun is shining in the background. I like it because it reminds me of a happy day.'
  },
  {
    id: 'w10',
    title: 'What I want to be',
    prompt: 'Write about what you want to be when you grow up. What job? Why do you want to do it? What do you need to study? Write 60–80 words.',
    wordMin: 60, wordMax: 80,
    keywords: ['want to be', 'job', 'study'],
    bonus: ['doctor', 'teacher', 'engineer', 'vet', 'artist', 'help', 'animals', 'science'],
    trapWords: ['hacer', 'quiero', 'trabajo', 'mayor'],
    model: 'When I grow up I want to be a vet because I love animals. I need to study science and biology at school. I want to help cats, dogs and other animals when they are sick. It is a very important job.'
  }
];

// ===================== READING =====================
// texts: Cambridge A2 Key style, 80-150 words
// questions: mc (multiple choice) o gap (fill the gap)

const READING_POOL = [
  {
    id: 'r1',
    title: 'A Day at the Beach',
    text: 'Last Saturday my family and I went to the beach. The weather was warm and sunny. I swam in the sea and built a big sandcastle with my brother. My mum read a book under an umbrella. We had sandwiches and juice for lunch. In the afternoon we walked along the coast and took photos. We went home at six o\'clock. It was a fantastic day!',
    questions: [
      { type: 'mc', stem: 'What did the writer do at the beach?', options: ['Played football', 'Swam and built a sandcastle', 'Read a book'], answer: 1 },
      { type: 'mc', stem: 'What did they have for lunch?', options: ['Pizza and cola', 'Sandwiches and juice', 'Fish and chips'], answer: 1 },
      { type: 'gap', stem: 'They went home at ______ o\'clock.', answer: 'six' },
      { type: 'mc', stem: 'How did the writer feel about the day?', options: ['Bored', 'Fantastic', 'Tired'], answer: 1 }
    ]
  },
  {
    id: 'r2',
    title: 'My Pet Dog',
    text: 'Hello, my name is Tom and I am twelve years old. I have a pet dog called Max. Max is brown and white and he is very friendly. Every morning I take Max for a walk in the park before school. At the weekend, we play in the garden. Max loves to chase balls and swim in the river. He sleeps in my bedroom. Max is my best friend.',
    questions: [
      { type: 'gap', stem: 'The dog\'s name is ______.', answer: 'max' },
      { type: 'mc', stem: 'Where does Tom walk Max every morning?', options: ['In the garden', 'In the park', 'In the river'], answer: 1 },
      { type: 'mc', stem: 'What does Max love to do?', options: ['Sleep all day', 'Chase balls and swim', 'Eat a lot'], answer: 1 },
      { type: 'gap', stem: 'Max sleeps in Tom\'s ______.', answer: 'bedroom' }
    ]
  },
  {
    id: 'r3',
    title: 'The School Trip',
    text: 'Last Tuesday our class went on a school trip to the Natural History Museum. We travelled by bus and it took forty minutes. At the museum we saw dinosaur skeletons and a giant whale model. Our guide explained how animals lived millions of years ago. We had lunch in the museum café. I bought a small dinosaur toy from the gift shop. It was an interesting day.',
    questions: [
      { type: 'mc', stem: 'Where did the class go?', options: ['An art gallery', 'The Natural History Museum', 'A zoo'], answer: 1 },
      { type: 'gap', stem: 'They travelled by ______.', answer: 'bus' },
      { type: 'mc', stem: 'What did the writer buy?', options: ['A book', 'A dinosaur toy', 'A postcard'], answer: 1 },
      { type: 'gap', stem: 'The journey took ______ minutes.', answer: 'forty' }
    ]
  },
  {
    id: 'r4',
    title: 'A Letter from London',
    text: 'Dear Grandma, I am having a great time in London with Aunt Sue. Yesterday we visited the Tower of London and saw the Crown Jewels. They were beautiful! We also walked across Tower Bridge and took lots of pictures. Today we are going to the London Eye. The weather is cold but sunny. I love London! See you soon. Love, Emma',
    questions: [
      { type: 'mc', stem: 'Who is Emma with in London?', options: ['Her parents', 'Aunt Sue', 'Her friends'], answer: 1 },
      { type: 'mc', stem: 'What did they see at the Tower of London?', options: ['Old paintings', 'The Crown Jewels', 'A zoo'], answer: 1 },
      { type: 'gap', stem: 'Today they are going to the London ______.', answer: 'eye' },
      { type: 'mc', stem: 'What is the weather like?', options: ['Hot and rainy', 'Cold but sunny', 'Warm and cloudy'], answer: 1 }
    ]
  },
  {
    id: 'r5',
    title: 'My Favourite Sport',
    text: 'My favourite sport is basketball. I play it every Thursday after school with my friends. There is a basketball court near my house. I am not very tall but I am fast. I can run and throw the ball well. My favourite player is Pau Gasol. He is from Spain and he played in the NBA. I want to play for my school team next year.',
    questions: [
      { type: 'mc', stem: 'When does the writer play basketball?', options: ['Every Tuesday', 'Every Thursday', 'Every Saturday'], answer: 1 },
      { type: 'gap', stem: 'There is a basketball court near the writer\'s ______.', answer: 'house' },
      { type: 'mc', stem: 'Who is the writer\'s favourite player?', options: ['Pau Gasol', 'Michael Jordan', 'Leo Messi'], answer: 0 },
      { type: 'gap', stem: 'The writer wants to play for his school ______ next year.', answer: 'team' }
    ]
  },
  {
    id: 'r6',
    title: 'A Family Dinner',
    text: 'Every Sunday my family has a big dinner together. My grandmother cooks paella, which is my favourite dish. My grandfather tells funny stories. My cousins and I play in the living room while the adults talk. We usually eat at three o\'clock in the afternoon. After dinner we have dessert. My aunt often brings homemade cake. I love these family dinners!',
    questions: [
      { type: 'mc', stem: 'When does the family have a big dinner?', options: ['Every Saturday', 'Every Sunday', 'Every Friday'], answer: 1 },
      { type: 'gap', stem: 'The grandmother cooks ______.', answer: 'paella' },
      { type: 'mc', stem: 'What does the grandfather do?', options: ['Sings songs', 'Tells funny stories', 'Watches TV'], answer: 1 },
      { type: 'mc', stem: 'What does the aunt often bring?', options: ['Ice cream', 'Homemade cake', 'Fruit salad'], answer: 1 }
    ]
  },
  {
    id: 'r7',
    title: 'The New Neighbour',
    text: 'A new family moved into the house next door last week. They have a son called Leo who is in my class at school. We quickly became friends. Leo is from France and he speaks French and Spanish. I am teaching him English and he teaches me French. On Saturday we played football in the garden. It is great to have a new friend so close to home.',
    questions: [
      { type: 'mc', stem: 'Where is the new family from?', options: ['Italy', 'France', 'England'], answer: 1 },
      { type: 'gap', stem: 'The son\'s name is ______.', answer: 'leo' },
      { type: 'mc', stem: 'What did the writer and Leo do on Saturday?', options: ['Played football', 'Watched a film', 'Went swimming'], answer: 0 },
      { type: 'mc', stem: 'What languages does Leo speak?', options: ['English and Spanish', 'French and Spanish', 'French and English'], answer: 1 }
    ]
  },
  {
    id: 'r8',
    title: 'At the Shopping Centre',
    text: 'Yesterday I went to the shopping centre with my sister. She wanted to buy a new dress for a party. We looked in many shops. She tried on a red dress and a blue dress. She chose the blue one because it was cheaper. I bought a book about space. Afterwards we had ice cream at the café. It was a nice afternoon.',
    questions: [
      { type: 'gap', stem: 'The writer went with his/her ______.', answer: 'sister' },
      { type: 'mc', stem: 'What did the sister want to buy?', options: ['Shoes', 'A dress', 'A bag'], answer: 1 },
      { type: 'mc', stem: 'Why did she choose the blue dress?', options: ['It was prettier', 'It was cheaper', 'It was smaller'], answer: 1 },
      { type: 'gap', stem: 'The writer bought a book about ______.', answer: 'space' }
    ]
  },
  {
    id: 'r9',
    title: 'My Summer Holiday',
    text: 'This summer I went to Asturias in the north of Spain with my parents. We stayed in a small village near the mountains. Every day we went hiking and saw beautiful lakes and forests. The food was delicious. My favourite was the local cheese. On our last day we visited a beach with golden sand. I want to go back next year!',
    questions: [
      { type: 'mc', stem: 'Where is Asturias?', options: ['In the south of Spain', 'In the north of Spain', 'In central Spain'], answer: 1 },
      { type: 'gap', stem: 'They stayed in a small village near the ______.', answer: 'mountains' },
      { type: 'mc', stem: 'What was the writer\'s favourite food?', options: ['The local cheese', 'The seafood', 'The bread'], answer: 0 },
      { type: 'gap', stem: 'On the last day they visited a beach with golden ______.', answer: 'sand' }
    ]
  },
  {
    id: 'r10',
    title: 'A Rainy Weekend',
    text: 'Last weekend it rained all day on Saturday. I could not go outside to play football. Instead, I stayed at home and read a comic book. In the afternoon I helped my dad bake a chocolate cake. It was delicious! On Sunday the rain stopped and I went to the park with my friend. We played on the swings and had a great time.',
    questions: [
      { type: 'gap', stem: 'Last weekend it rained on ______.', answer: 'saturday' },
      { type: 'mc', stem: 'What did the writer do instead of playing football?', options: ['Played video games', 'Read a comic book', 'Watched TV'], answer: 1 },
      { type: 'mc', stem: 'What did the writer bake with his/her dad?', options: ['A pizza', 'A chocolate cake', 'Cookies'], answer: 1 },
      { type: 'mc', stem: 'What did they play on at the park?', options: ['The slide', 'The swings', 'The seesaw'], answer: 1 }
    ]
  }
];

// ===================== LISTENING =====================
// transcript: texto que se lee en voz alta con SpeechSynthesis
// questions: igual que Reading

const LISTENING_POOL = [
  {
    id: 'l1',
    title: 'My Family',
    transcript: 'Hi, I am Emma. I live with my mum, my dad and my little brother. My brother is seven years old and his name is Jack. My mum is a teacher and my dad is a doctor. We have a cat called Whiskers. On Saturdays we all have breakfast together and then we go to the park. I love my family very much.',
    questions: [
      { type: 'mc', stem: 'How old is Emma\'s brother?', options: ['Five', 'Seven', 'Nine'], answer: 1 },
      { type: 'gap', stem: 'The cat\'s name is ______.', answer: 'whiskers' },
      { type: 'mc', stem: 'What does Emma\'s mum do?', options: ['Doctor', 'Teacher', 'Nurse'], answer: 1 }
    ]
  },
  {
    id: 'l2',
    title: 'The School Bus',
    transcript: 'Every morning I take the school bus. I wait at the bus stop at quarter to eight. My friend Sarah waits with me. The bus is always on time. The journey takes twenty minutes. On the bus I sit with my friends and we talk about our homework or play games on our phones. The bus driver is very nice and always says hello.',
    questions: [
      { type: 'gap', stem: 'The writer waits at the bus stop at quarter to ______.', answer: 'eight' },
      { type: 'mc', stem: 'How long does the journey take?', options: ['Ten minutes', 'Twenty minutes', 'Thirty minutes'], answer: 1 },
      { type: 'mc', stem: 'What does the bus driver always do?', options: ['Tells jokes', 'Says hello', 'Plays music'], answer: 1 }
    ]
  },
  {
    id: 'l3',
    title: 'At the Restaurant',
    transcript: 'Last Saturday my family went to an Italian restaurant. We sat at a table near the window. I ordered spaghetti with tomato sauce. My dad had pizza and my mum ordered a salad. For dessert I had ice cream with chocolate sauce. The food was delicious and the waiter was very friendly. We go there every year for my birthday.',
    questions: [
      { type: 'mc', stem: 'What type of restaurant did they go to?', options: ['Chinese', 'Italian', 'Mexican'], answer: 1 },
      { type: 'gap', stem: 'The writer ordered spaghetti with tomato ______.', answer: 'sauce' },
      { type: 'mc', stem: 'What did the writer have for dessert?', options: ['Cake', 'Ice cream', 'Fruit'], answer: 1 }
    ]
  },
  {
    id: 'l4',
    title: 'Going Shopping',
    transcript: 'Yesterday after school I went to the supermarket with my mum. We needed to buy food for the week. We got milk, bread, eggs, cheese and fruit. My mum also bought some chicken for dinner. I helped carry the bags. On the way home we stopped at the bakery and bought a chocolate croissant for me. It was my reward for helping.',
    questions: [
      { type: 'mc', stem: 'Where did they go after school?', options: ['The bakery', 'The supermarket', 'The market'], answer: 1 },
      { type: 'gap', stem: 'Mum bought some chicken for ______.', answer: 'dinner' },
      { type: 'mc', stem: 'What did the writer get as a reward?', options: ['A cake', 'A chocolate croissant', 'A cookie'], answer: 1 }
    ]
  },
  {
    id: 'l5',
    title: 'The Birthday Party',
    transcript: 'My cousin Laura had her birthday party last Saturday. She turned fourteen. The party was at her house and there were about twenty people. We played party games like musical chairs and pin the tail on the donkey. Laura got lots of presents. I gave her a book about photography because she loves taking photos. We had cake and danced until nine o\'clock.',
    questions: [
      { type: 'gap', stem: 'Laura turned ______ years old.', answer: 'fourteen' },
      { type: 'mc', stem: 'How many people were at the party?', options: ['About ten', 'About twenty', 'About thirty'], answer: 1 },
      { type: 'mc', stem: 'What did the writer give Laura?', options: ['A book about photography', 'A CD', 'A T-shirt'], answer: 0 },
      { type: 'gap', stem: 'They danced until ______ o\'clock.', answer: 'nine' }
    ]
  },
  {
    id: 'l6',
    title: 'My Best Friend',
    transcript: 'My best friend is called Sara. We have known each other since primary school. Sara is very kind and always helps me when I have a problem. She has long curly hair and green eyes. We have the same favourite band and we love watching films together. At weekends we often go to the cinema or just hang out at the park. She is like a sister to me.',
    questions: [
      { type: 'mc', stem: 'How long have they known each other?', options: ['Since primary school', 'Since last year', 'Since they were babies'], answer: 0 },
      { type: 'gap', stem: 'Sara has long curly hair and ______ eyes.', answer: 'green' },
      { type: 'mc', stem: 'What do they often do at weekends?', options: ['Go shopping', 'Go to the cinema or the park', 'Do homework together'], answer: 1 }
    ]
  },
  {
    id: 'l7',
    title: 'At the Doctor',
    transcript: 'Yesterday I went to the doctor because I had a sore throat. The doctor was very nice. She looked at my throat and said it was not serious. She told me to drink lots of water and rest. My mum bought me some medicine from the pharmacy. Today I feel much better. I can go back to school tomorrow.',
    questions: [
      { type: 'gap', stem: 'The writer had a sore ______.', answer: 'throat' },
      { type: 'mc', stem: 'What did the doctor tell the writer to do?', options: ['Take medicine three times a day', 'Drink water and rest', 'Stay in bed for a week'], answer: 1 },
      { type: 'gap', stem: 'Mum bought medicine from the ______.', answer: 'pharmacy' }
    ]
  },
  {
    id: 'l8',
    title: 'The Museum Visit',
    transcript: 'Last Sunday our family visited the Science Museum. There were lots of interactive exhibits. My favourite was the space section where you could sit inside a model of a rocket. My little brother loved the dinosaur area. We spent three hours there and still did not see everything. I want to go again next holidays.',
    questions: [
      { type: 'mc', stem: 'Which museum did they visit?', options: ['The Art Museum', 'The Science Museum', 'The History Museum'], answer: 1 },
      { type: 'gap', stem: 'The writer\'s favourite section was about ______.', answer: 'space' },
      { type: 'mc', stem: 'How long did they spend there?', options: ['Two hours', 'Three hours', 'Four hours'], answer: 1 }
    ]
  },
  {
    id: 'l9',
    title: 'Sports Day',
    transcript: 'Last Friday was Sports Day at my school. I took part in the running race and I came second! I won a silver medal. My friend Alex won the long jump. The best part was the relay race. Our team won and everyone cheered. My parents came to watch and they were very proud. Next year I want to win the gold medal.',
    questions: [
      { type: 'mc', stem: 'What place did the writer get in the running race?', options: ['First', 'Second', 'Third'], answer: 1 },
      { type: 'gap', stem: 'The writer won a silver ______.', answer: 'medal' },
      { type: 'mc', stem: 'What did Alex win?', options: ['The running race', 'The long jump', 'The relay'], answer: 1 },
      { type: 'gap', stem: 'The writer wants to win ______ next year.', answer: 'gold' }
    ]
  },
  {
    id: 'l10',
    title: 'A Phone Call',
    transcript: 'Yesterday evening my grandmother called me on the phone. She lives in Valencia and I miss her a lot. She asked about my school and my friends. I told her about my English exam. She said she was proud of me. We talked for twenty minutes. She promised to visit us next month. I am very excited to see her.',
    questions: [
      { type: 'gap', stem: 'The writer\'s grandmother lives in ______.', answer: 'valencia' },
      { type: 'mc', stem: 'How long did they talk?', options: ['Ten minutes', 'Twenty minutes', 'Thirty minutes'], answer: 1 },
      { type: 'mc', stem: 'When will the grandmother visit?', options: ['Next week', 'Next month', 'Next year'], answer: 1 }
    ]
  }
];

// ============================================================
// TRACKER — localStorage: qué ejercicios ha visto el alumno
// ============================================================
// Formato: { w1: 3, r2: 1, l5: 2 }  → contador de veces visto

const POOL_SEEN_KEY = 'poolSeen';

function getPoolSeen() {
  try { return JSON.parse(localStorage.getItem(POOL_SEEN_KEY)) || {}; } catch(e) { return {}; }
}

function markPoolSeen(id) {
  var seen = getPoolSeen();
  seen[id] = (seen[id] || 0) + 1;
  localStorage.setItem(POOL_SEEN_KEY, JSON.stringify(seen));
}

function getPoolSeenCount(id) {
  return getPoolSeen()[id] || 0;
}

// ============================================================
// HELPERS — Rotación
// ============================================================

// Devuelve N ejercicios del pool, priorizando los que más ha visto
function getPoolSelection(pool, n) {
  var seen = getPoolSeen();
  // Ordenar: los más vistos primero
  var sorted = pool.slice().sort(function(a, b) {
    return (seen[b.id] || 0) - (seen[a.id] || 0);
  });
  return sorted.slice(0, n);
}

// Barajar array (Fisher-Yates)
function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
  }
  return arr;
}

// ============================================================
// REGISTRO DE SECCIONES EN EL SPA
// ============================================================
// Se llama DESPUÉS de definir SECTIONS en index.html
function registerPoolSections(SECTIONS) {
  if (!SECTIONS) return;

  // ---- READING ----
  SECTIONS['reading'] = '<div class="section active" style="display:block">' +
    '<h2>📖 Reading Practice</h2>' +
    '<p class="intro">10 textos estilo Cambridge A2 Key. Lee cada texto y responde las preguntas. ¡Cuantos más hagas, más te saldrán en el examen!</p>' +
    '<div id="rd-container"><p style="color:var(--text2)">⏳ Cargando...</p></div></div>';

  // ---- LISTENING ----
  SECTIONS['listening'] = '<div class="section active" style="display:block">' +
    '<h2>🎧 Listening Practice</h2>' +
    '<p class="intro">10 ejercicios con SpeechSynthesis. Pulsa ▶️ para escuchar y responde. Puedes repetir el audio.</p>' +
    '<div id="lst-container"><p style="color:var(--text2)">⏳ Cargando...</p></div></div>';

  // ---- WRITING PRACTICE ----
  SECTIONS['writing-practice'] = '<div class="section active" style="display:block">' +
    '<h2>✍️ Writing Practice</h2>' +
    '<p class="intro">10 ejercicios de escritura con corrección por palabras clave. Escribe 60–80 palabras. Detecta españolismos.</p>' +
    '<div id="wp-container"><p style="color:var(--text2)">⏳ Cargando...</p></div></div>';
}

// ============================================================
// RENDERIZADO DE READING
// ============================================================
function renderPoolReading() {
  var pool = READING_POOL || [];
  var html = '';
  pool.forEach(function(ex, i) {
    var seen = getPoolSeen();
    var times = seen[ex.id] || 0;
    html += '<div class="section" style="cursor:pointer;padding:14px 20px" onclick="_toggleRd('+i+')">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<h3 style="margin:0;font-size:1rem;border:none;padding:0">📖 ' + ex.title + '</h3>';
    html += '<span style="font-size:0.8rem;color:var(--text2)">' + ex.questions.length + ' preg · ' + (times > 0 ? '✅ vista '+times+' vez' : '🆕 nueva') + '</span>';
    html += '</div>';
    html += '<div id="_rd-'+i+'" style="display:none;margin-top:14px">';
    html += '<div class="theory-box" style="font-size:0.95rem;line-height:1.7">' + ex.text + '</div>';
    html += '<div id="_rdq-'+i+'" style="margin-top:12px"></div>';
    html += '<div class="btn-section"><button class="btn btn-check-all" onclick="_checkRd('+i+')">✅ Corregir</button><button class="btn btn-reset" onclick="_resetRd('+i+')">🔄 Limpiar</button></div>';
    html += '<div id="_rdsc-'+i+'" class="score-box" style="display:none"></div>';
    html += '</div></div>';
  });
  var c = document.getElementById('rd-container');
  if (c) c.innerHTML = html;

  // Render questions
  pool.forEach(function(ex, i) {
    var qh = '';
    ex.questions.forEach(function(q, j) {
      if (q.type === 'mc') {
        qh += '<div class="exercise-card" style="margin:8px 0;padding:12px 16px">';
        qh += '<p class="stem" style="margin-bottom:8px"><strong>'+(j+1)+'.</strong> ' + q.stem + '</p><div class="mc-options">';
        q.options.forEach(function(o, k) {
          qh += '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;font-size:0.85rem">';
          qh += '<input type="radio" name="_rdr'+i+'-'+j+'" value="'+k+'" style="margin:0"> ' + o + '</label>';
        });
        qh += '</div></div>';
      } else {
        qh += '<div class="exercise-card" style="margin:8px 0;padding:12px 16px">';
        qh += '<p class="stem" style="margin-bottom:8px"><strong>'+(j+1)+'.</strong> ' + q.stem + '</p>';
        qh += '<input type="text" id="_rdg-'+i+'-'+j+'" placeholder="Escribe..." style="display:block;width:100%;max-width:300px;border:2px solid var(--border);border-radius:4px;padding:6px 10px;font-size:0.9rem"></div>';
      }
    });
    var qc = document.getElementById('_rdq-'+i);
    if (qc) qc.innerHTML = qh;
  });
}

window._toggleRd = function(i) {
  var el = document.getElementById('_rd-'+i);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (el.style.display === 'block') markPoolSeen(READING_POOL[i].id);
};

window._checkRd = function(i) {
  var ex = READING_POOL[i];
  var correct = 0, total = ex.questions.length;
  ex.questions.forEach(function(q, j) {
    if (q.type === 'mc') {
      var radios = document.getElementsByName('_rdr'+i+'-'+j);
      var sel = null;
      if (radios) radios.forEach(function(r) { if (r.checked) sel = parseInt(r.value); });
      var labels = radios && radios[0] ? radios[0].closest('.mc-options').querySelectorAll('label') : [];
      labels.forEach(function(l, k) {
        l.style.background = k === q.answer ? 'var(--success-bg)' : '';
        l.style.borderColor = k === q.answer ? 'var(--success)' : '';
      });
      if (sel === q.answer) correct++;
    } else {
      var inp = document.getElementById('_rdg-'+i+'-'+j);
      if (inp) {
        inp.className = inp.value.trim().toLowerCase() === q.answer.toLowerCase() ? 'correct' : 'wrong';
        if (inp.className === 'correct') correct++;
      }
    }
  });
  document.getElementById('_rdsc-'+i).style.display = 'block';
  document.getElementById('_rdsc-'+i).innerHTML = '<span class="big">'+correct+'/'+total+'</span> ('+Math.round(correct/total*100)+'%) '+(correct===total?'🏆':correct/total>=0.7?'👏':correct/total>=0.5?'👍':'💪');
};

window._resetRd = function(i) {
  READING_POOL[i].questions.forEach(function(q, j) {
    if (q.type === 'mc') {
      var radios = document.getElementsByName('_rdr'+i+'-'+j);
      if (radios) radios.forEach(function(r) { r.checked = false; });
      var labels = radios && radios[0] ? radios[0].closest('.mc-options').querySelectorAll('label') : [];
      labels.forEach(function(l) { l.style.background = ''; l.style.borderColor = ''; });
    } else {
      var inp = document.getElementById('_rdg-'+i+'-'+j);
      if (inp) { inp.value = ''; inp.className = ''; }
    }
  });
  var sc = document.getElementById('_rdsc-'+i);
  if (sc) { sc.style.display = 'none'; sc.innerHTML = ''; }
};

// ============================================================
// RENDERIZADO DE LISTENING
// ============================================================
function renderPoolListening() {
  var pool = LISTENING_POOL || [];
  var html = '';
  pool.forEach(function(ex, i) {
    var seen = getPoolSeen();
    var times = seen[ex.id] || 0;
    html += '<div class="section" style="cursor:pointer;padding:14px 20px" onclick="_toggleLst('+i+')">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<h3 style="margin:0;font-size:1rem;border:none;padding:0">🎧 ' + ex.title + '</h3>';
    html += '<span style="font-size:0.8rem;color:var(--text2)">' + ex.questions.length + ' preg · ' + (times > 0 ? '✅ vista '+times+' vez' : '🆕 nueva') + '</span>';
    html += '</div>';
    html += '<div id="_lst-'+i+'" style="display:none;margin-top:14px">';
    html += '<div class="btn-section" style="margin-bottom:10px">';
    html += '<button class="btn btn-check-all" onclick="_playLst('+i+')" style="background:#20c997">▶️ Escuchar</button>';
    html += '<button class="btn btn-answer" onclick="_showTrans('+i+')" style="background:#fab005;color:#212529">📝 Transcripción</button></div>';
    html += '<div id="_tran-'+i+'" class="theory-box" style="display:none;font-size:0.9rem;line-height:1.6"></div>';
    html += '<div id="_lstq-'+i+'" style="margin-top:12px"></div>';
    html += '<div class="btn-section"><button class="btn btn-check-all" onclick="_checkLst('+i+')">✅ Corregir</button><button class="btn btn-reset" onclick="_resetLst('+i+')">🔄 Limpiar</button></div>';
    html += '<div id="_lstsc-'+i+'" class="score-box" style="display:none"></div>';
    html += '</div></div>';
  });
  var c = document.getElementById('lst-container');
  if (c) c.innerHTML = html;

  pool.forEach(function(ex, i) {
    var qh = '';
    ex.questions.forEach(function(q, j) {
      if (q.type === 'mc') {
        qh += '<div class="exercise-card" style="margin:8px 0;padding:12px 16px">';
        qh += '<p class="stem" style="margin-bottom:8px"><strong>'+(j+1)+'.</strong> ' + q.stem + '</p><div class="mc-options">';
        q.options.forEach(function(o, k) {
          qh += '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:4px;font-size:0.85rem">';
          qh += '<input type="radio" name="_lstr'+i+'-'+j+'" value="'+k+'" style="margin:0"> ' + o + '</label>';
        });
        qh += '</div></div>';
      } else {
        qh += '<div class="exercise-card" style="margin:8px 0;padding:12px 16px">';
        qh += '<p class="stem" style="margin-bottom:8px"><strong>'+(j+1)+'.</strong> ' + q.stem + '</p>';
        qh += '<input type="text" id="_lstg-'+i+'-'+j+'" placeholder="Escribe..." style="display:block;width:100%;max-width:300px;border:2px solid var(--border);border-radius:4px;padding:6px 10px;font-size:0.9rem"></div>';
      }
    });
    var qc = document.getElementById('_lstq-'+i);
    if (qc) qc.innerHTML = qh;
    var tc = document.getElementById('_tran-'+i);
    if (tc) tc.textContent = ex.transcript;
  });
}

window._toggleLst = function(i) {
  var el = document.getElementById('_lst-'+i);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (el.style.display === 'block') markPoolSeen(LISTENING_POOL[i].id);
};

window._playLst = function(i) {
  var ex = LISTENING_POOL[i];
  if (!ex) return;
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(ex.transcript);
  u.lang = 'en-GB'; u.rate = 0.85;
  var v = speechSynthesis.getVoices().find(function(x) { return x.lang.startsWith('en-GB'); });
  if (v) u.voice = v;
  speechSynthesis.speak(u);
};

window._showTrans = function(i) {
  var el = document.getElementById('_tran-'+i);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window._checkLst = function(i) {
  var ex = LISTENING_POOL[i];
  var correct = 0, total = ex.questions.length;
  ex.questions.forEach(function(q, j) {
    if (q.type === 'mc') {
      var radios = document.getElementsByName('_lstr'+i+'-'+j);
      var sel = null;
      if (radios) radios.forEach(function(r) { if (r.checked) sel = parseInt(r.value); });
      var labels = radios && radios[0] ? radios[0].closest('.mc-options').querySelectorAll('label') : [];
      labels.forEach(function(l, k) {
        l.style.background = k === q.answer ? 'var(--success-bg)' : '';
        l.style.borderColor = k === q.answer ? 'var(--success)' : '';
      });
      if (sel === q.answer) correct++;
    } else {
      var inp = document.getElementById('_lstg-'+i+'-'+j);
      if (inp) {
        inp.className = inp.value.trim().toLowerCase() === q.answer.toLowerCase() ? 'correct' : 'wrong';
        if (inp.className === 'correct') correct++;
      }
    }
  });
  document.getElementById('_lstsc-'+i).style.display = 'block';
  document.getElementById('_lstsc-'+i).innerHTML = '<span class="big">'+correct+'/'+total+'</span> ('+Math.round(correct/total*100)+'%) '+(correct===total?'🏆':correct/total>=0.7?'👏':correct/total>=0.5?'👍':'💪');
};

window._resetLst = function(i) {
  LISTENING_POOL[i].questions.forEach(function(q, j) {
    if (q.type === 'mc') {
      var radios = document.getElementsByName('_lstr'+i+'-'+j);
      if (radios) radios.forEach(function(r) { r.checked = false; });
      var labels = radios && radios[0] ? radios[0].closest('.mc-options').querySelectorAll('label') : [];
      labels.forEach(function(l) { l.style.background = ''; l.style.borderColor = ''; });
    } else {
      var inp = document.getElementById('_lstg-'+i+'-'+j);
      if (inp) { inp.value = ''; inp.className = ''; }
    }
  });
  var sc = document.getElementById('_lstsc-'+i);
  if (sc) { sc.style.display = 'none'; sc.innerHTML = ''; }
};

// ============================================================
// RENDERIZADO DE WRITING PRACTICE
// ============================================================
function renderPoolWriting() {
  var pool = WRITING_POOL || [];
  var html = '';
  pool.forEach(function(ex, i) {
    var seen = getPoolSeen();
    var times = seen[ex.id] || 0;
    html += '<div class="section" style="cursor:pointer;padding:14px 20px" onclick="_toggleWp('+i+')">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center">';
    html += '<h3 style="margin:0;font-size:1rem;border:none;padding:0">✍️ ' + ex.title + '</h3>';
    html += '<span style="font-size:0.8rem;color:var(--text2)">60-80 words · ' + (times > 0 ? '✅ vista '+times+' vez' : '🆕 nueva') + '</span>';
    html += '</div>';
    html += '<div id="_wp-'+i+'" style="display:none;margin-top:14px">';
    html += '<div class="theory-box" style="font-size:0.95rem"><strong>📝 Prompt:</strong> ' + ex.prompt + '</div>';
    html += '<textarea id="_wpt-'+i+'" oninput="_wpStats('+i+')" placeholder="Escribe aquí (60-80 palabras)..." style="width:100%;min-height:120px;border:2px solid var(--border);border-radius:8px;padding:10px;font-size:0.9rem;font-family:inherit;resize:vertical;margin-top:10px"></textarea>';
    html += '<div id="_wps-'+i+'" class="writing-stats" style="font-size:0.8rem;color:var(--text2);margin-top:4px">📝 0 palabras · mínimo 60 · máximo 80</div>';
    html += '<div class="btn-section"><button class="btn btn-check-all" onclick="_checkWp('+i+')">✅ Corregir</button>';
    html += '<button class="btn btn-answer" onclick="_showModel('+i+')" style="background:#fab005;color:#212529">💡 Ver modelo</button></div>';
    html += '<div id="_wpfb-'+i+'" class="score-box" style="display:none"></div>';
    html += '<div id="_wpm-'+i+'" class="theory-box" style="display:none;margin-top:8px;font-size:0.9rem"></div>';
    html += '</div></div>';
  });
  var c = document.getElementById('wp-container');
  if (c) c.innerHTML = html;
}

window._toggleWp = function(i) {
  var el = document.getElementById('_wp-'+i);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (el.style.display === 'block') markPoolSeen(WRITING_POOL[i].id);
};

window._wpStats = function(i) {
  var txt = document.getElementById('_wpt-'+i).value;
  var wc = txt.trim() ? txt.trim().split(/\s+/).length : 0;
  var s = document.getElementById('_wps-'+i);
  if (s) s.textContent = '📝 ' + wc + ' palabras · mínimo 60 · máximo 80';
};

window._checkWp = function(i) {
  var ex = WRITING_POOL[i];
  var txt = document.getElementById('_wpt-'+i).value.trim();
  var fb = document.getElementById('_wpfb-'+i);
  var words = txt ? txt.split(/\s+/).length : 0;

  if (words < ex.wordMin) {
    fb.style.display = 'block';
    fb.innerHTML = '❌ Demasiado corto: ' + words + ' palabras. Necesitas al menos ' + ex.wordMin + '.';
    return;
  }

  var lower = txt.toLowerCase();
  var foundKw = 0, kwHtml = '';
  ex.keywords.forEach(function(kw) {
    var found = kw.split(' ').every(function(p) { return lower.indexOf(p) >= 0; });
    kwHtml += '<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:4px;font-size:0.8rem;' + (found ? 'background:var(--success-bg);color:#2b8a3e' : 'background:var(--error-bg);color:#c92a2a') + '">' + kw + ' ' + (found ? '✓' : '✗') + '</span>';
    if (found) foundKw++;
  });

  var foundBonus = 0, bonusHtml = '';
  ex.bonus.forEach(function(bw) {
    var found = lower.indexOf(bw) >= 0;
    bonusHtml += '<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:4px;font-size:0.8rem;' + (found ? 'background:var(--success-bg);color:#2b8a3e' : 'background:var(--bg);color:var(--text2)') + '">' + bw + (found ? ' ✓' : '') + '</span>';
    if (found) foundBonus++;
  });

  var foundTraps = [];
  ex.trapWords.forEach(function(tw) { if (lower.indexOf(tw) >= 0) foundTraps.push(tw); });

  var kwScore = (foundKw / ex.keywords.length) * 60;
  var bonusScore = Math.min((foundBonus / ex.bonus.length) * 30, 30);
  var wordScore = words >= ex.wordMin && words <= ex.wordMax ? 10 : words < ex.wordMin ? 0 : 5;
  var totalScore = Math.round(kwScore + bonusScore + wordScore);

  var html = '<div style="font-size:1.2rem;font-weight:bold;margin-bottom:8px">📊 Puntuación: ' + totalScore + '/100</div>';
  html += '<div style="text-align:left;font-size:0.9rem">';
  html += '<p><strong>🔑 Palabras clave (' + foundKw + '/' + ex.keywords.length + '):</strong><br>' + kwHtml + '</p>';
  html += '<p style="margin-top:6px"><strong>✨ Vocabulario extra (' + foundBonus + '/' + ex.bonus.length + '):</strong><br>' + bonusHtml + '</p>';
  html += '<p style="margin-top:6px"><strong>📏 Longitud:</strong> ' + words + ' palabras (objetivo: ' + ex.wordMin + '-' + ex.wordMax + ')' + (words >= ex.wordMin && words <= ex.wordMax ? ' ✅' : ' ⚠️') + '</p>';
  if (foundTraps.length > 0) {
    html += '<p style="margin-top:6px;color:#c92a2a"><strong>⚠️ Españolismos:</strong> ' + foundTraps.join(', ') + '</p>';
    html += '<p style="font-size:0.8rem;color:var(--text2)">Intenta usar sinónimos en inglés.</p>';
  }
  html += '</div>';
  fb.style.display = 'block';
  fb.innerHTML = html;
};

window._showModel = function(i) {
  var el = document.getElementById('_wpm-'+i);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  el.innerHTML = '<strong>📝 Respuesta modelo:</strong><br>' + (WRITING_POOL[i].model || '');
};
