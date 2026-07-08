// Exercise Library seed data.
//
// Every slug referenced by `src/lib/workout/exercise-pools.ts` (the AI workout
// generator's canonical exercise list) MUST have a matching entry here — the
// generator assumes an `Exercise` row exists for each slug it references.
//
// Fields mirror the `Exercise` model in `prisma/schema.prisma` exactly, minus
// the auto-generated `id` and `createdAt`.

import type { Difficulty } from "@/types";

export interface ExerciseSeed {
  name: string;
  nameAr: string | null;
  slug: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  difficulty: Difficulty;
  equipment: string;
  instructions: string;
  instructionsAr: string | null;
  commonMistakes: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  animationUrl: string | null;
  alternativeSlugs: string[];
}

export const exercisesSeedData: ExerciseSeed[] = [
  // ── Chest ──────────────────────────────────────────────────────────────
  {
    name: "Barbell Bench Press",
    nameAr: "ضغط البنش بالبار",
    slug: "barbell-bench-press",
    muscleGroup: "Chest",
    secondaryMuscles: ["Shoulders", "Triceps"],
    difficulty: "INTERMEDIATE",
    equipment: "Barbell",
    instructions:
      "1. Lie flat on the bench with your eyes under the bar and feet planted firmly on the floor.\n2. Grip the bar slightly wider than shoulder-width and unrack it over your chest.\n3. Lower the bar with control to your mid-chest, keeping your elbows at roughly a 45-degree angle.\n4. Press the bar back up explosively until your arms are fully extended.\n5. Repeat for the desired number of reps, keeping your shoulder blades pinned to the bench throughout.",
    instructionsAr:
      "1. استلقِ على المقعد بحيث تكون عيناك أسفل البار مباشرة وقدماك ثابتتان على الأرض.\n2. أمسك البار بقبضة أوسع قليلاً من عرض الكتفين وارفعه من الحامل فوق صدرك مباشرة.\n3. أنزل البار ببطء وتحكم نحو منتصف صدرك، مع إبقاء المرفقين بزاوية حوالي 45 درجة.\n4. ادفع البار للأعلى بقوة حتى يستقيم ذراعاك بالكامل.\n5. كرر الحركة للعدد المطلوب مع إبقاء لوحي الكتف ملتصقين بالمقعد طوال التمرين.",
    commonMistakes:
      "Bouncing the bar off the chest reduces muscle tension and risks injury. Flaring the elbows out to 90 degrees places excessive stress on the shoulder joints. Many lifters also lift their hips off the bench to generate momentum instead of controlling the weight.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["incline-dumbbell-press", "cable-chest-fly", "dips-chest"],
  },
  {
    name: "Incline Dumbbell Press",
    nameAr: "ضغط الدمبل المائل",
    slug: "incline-dumbbell-press",
    muscleGroup: "Chest",
    secondaryMuscles: ["Shoulders", "Triceps"],
    difficulty: "INTERMEDIATE",
    equipment: "Dumbbell",
    instructions:
      "1. Set an adjustable bench to a 30-45 degree incline and sit with a dumbbell in each hand resting on your thighs.\n2. Kick the dumbbells up one at a time as you lie back, positioning them at shoulder level.\n3. Press the dumbbells up and slightly inward until your arms are extended above your upper chest.\n4. Lower them slowly back to the starting position, feeling a stretch across the chest.\n5. Repeat for the target number of reps without letting the dumbbells drift toward your face.",
    instructionsAr:
      "1. اضبط المقعد المائل بزاوية 30-45 درجة واجلس ودمبل في كل يد فوق فخذيك.\n2. ارفع الدمبل تدريجيًا أثناء الاستلقاء حتى يصلا إلى مستوى الكتفين.\n3. ادفع الدمبل للأعلى وباتجاه الداخل قليلاً حتى يستقيم ذراعاك فوق الجزء العلوي من الصدر.\n4. أنزل الدمبل ببطء إلى وضع البداية مع الشعور بتمدد في عضلات الصدر.\n5. كرر الحركة للعدد المطلوب دون أن يتحرك الدمبل باتجاه الوجه.",
    commonMistakes:
      "Setting the incline too steep shifts the emphasis away from the chest and onto the front deltoids. Letting the dumbbells crash together at the top reduces time under tension, and using too much weight often causes the elbows to flare unsafely.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-bench-press", "cable-chest-fly", "push-up"],
  },
  {
    name: "Push-Up",
    nameAr: "تمرين الضغط",
    slug: "push-up",
    muscleGroup: "Chest",
    secondaryMuscles: ["Shoulders", "Triceps", "Core"],
    difficulty: "BEGINNER",
    equipment: "Bodyweight",
    instructions:
      "1. Start in a high plank position with hands slightly wider than shoulder-width and body in a straight line.\n2. Brace your core and glutes to prevent your hips from sagging.\n3. Bend your elbows to lower your chest toward the floor, keeping them at about 45 degrees from your torso.\n4. Push through your palms to return to the starting position.\n5. Repeat for the desired number of reps while maintaining a rigid, straight body line.",
    instructionsAr:
      "1. ابدأ بوضعية البلانك العالي مع يدين أوسع قليلاً من عرض الكتفين وجسم في خط مستقيم.\n2. شد عضلات البطن والأرداف لمنع هبوط الوسط.\n3. اثنِ مرفقيك لتنزل بصدرك نحو الأرض مع إبقائهما بزاوية 45 درجة تقريبًا من الجذع.\n4. ادفع بكفيك للعودة إلى وضع البداية.\n5. كرر الحركة للعدد المطلوب مع الحفاظ على استقامة الجسم طوال الوقت.",
    commonMistakes:
      "Letting the hips sag or pike up breaks the straight body line and reduces core engagement. Flaring the elbows straight out to the sides stresses the shoulders, and many beginners only complete a partial range of motion instead of lowering the chest close to the floor.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-bench-press", "dips-chest", "cable-chest-fly"],
  },
  {
    name: "Cable Chest Fly",
    nameAr: "تمرين فتح الصدر بالكابل",
    slug: "cable-chest-fly",
    muscleGroup: "Chest",
    secondaryMuscles: ["Shoulders"],
    difficulty: "INTERMEDIATE",
    equipment: "Cable Machine",
    instructions:
      "1. Set both cable pulleys to chest height and stand centered between them, holding a handle in each hand.\n2. Step forward slightly with a soft bend in the elbows to create tension.\n3. With a slight forward lean, sweep your arms together in an arcing motion until the handles meet in front of your chest.\n4. Squeeze your chest at the peak of the movement for a moment.\n5. Slowly return to the starting position, allowing a controlled stretch across the chest.",
    instructionsAr:
      "1. اضبط بكرتي الكابل على ارتفاع الصدر وقف في المنتصف بينهما ممسكًا بمقبض في كل يد.\n2. تقدم خطوة للأمام مع ثني بسيط في المرفقين لخلق توتر في العضلة.\n3. مع انحناء بسيط للأمام، حرك ذراعيك في مسار قوسي حتى يلتقي المقبضان أمام صدرك.\n4. اضغط على عضلة الصدر لحظة عند ذروة الحركة.\n5. عد ببطء إلى وضع البداية مع السماح بتمدد متحكم فيه عبر الصدر.",
    commonMistakes:
      "Bending the elbows too much turns the fly into a pressing movement rather than isolating the chest. Using excessive weight often causes the shoulders to round forward, and stopping short of full contraction at the front leaves gains on the table.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-bench-press", "incline-dumbbell-press", "dips-chest"],
  },
  {
    name: "Chest Dips",
    nameAr: "تمرين الغطس للصدر",
    slug: "dips-chest",
    muscleGroup: "Chest",
    secondaryMuscles: ["Triceps", "Shoulders"],
    difficulty: "INTERMEDIATE",
    equipment: "Dip Bars",
    instructions:
      "1. Grip the parallel bars and support your body with arms extended, leaning your torso slightly forward.\n2. Bend your elbows to lower your body until your upper arms are roughly parallel to the floor.\n3. Keep your elbows flared slightly outward to bias the chest rather than the triceps.\n4. Press back up through your palms until your arms are straight again.\n5. Repeat for the desired number of reps, controlling the descent rather than dropping quickly.",
    instructionsAr:
      "1. أمسك بالقضيبين المتوازيين وارفع جسمك بذراعين مستقيمتين مع إمالة الجذع للأمام قليلاً.\n2. اثنِ مرفقيك لتنزل جسمك حتى تصبح ذراعاك العلويتان شبه موازيتين للأرض.\n3. أبقِ مرفقيك متباعدين قليلاً للخارج لتركيز الحمل على الصدر بدلاً من الترايسبس.\n4. ادفع للأعلى عبر كفيك حتى تستقيم ذراعاك مجددًا.\n5. كرر الحركة للعدد المطلوب مع التحكم في النزول بدلًا من الهبوط السريع.",
    commonMistakes:
      "Staying too upright shifts the load onto the triceps instead of the chest. Going excessively deep without adequate shoulder mobility can strain the front of the shoulder, and using momentum by kipping the legs reduces the effectiveness of the exercise.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-bench-press", "push-up", "cable-chest-fly"],
  },

  // ── Back ───────────────────────────────────────────────────────────────
  {
    name: "Deadlift",
    nameAr: "الرفعة الميتة",
    slug: "deadlift",
    muscleGroup: "Back",
    secondaryMuscles: ["Legs", "Core", "Glutes"],
    difficulty: "ADVANCED",
    equipment: "Barbell",
    instructions:
      "1. Stand with feet hip-width apart, the bar over mid-foot, and grip it just outside your knees.\n2. Bend your knees until your shins touch the bar while keeping your back flat and chest up.\n3. Take a deep breath, brace your core, and drive through your heels to lift the bar, keeping it close to your body.\n4. Extend your hips and knees together until you are standing fully upright.\n5. Reverse the motion with control to lower the bar back to the floor, resetting your position for each rep.",
    instructionsAr:
      "1. قف وقدماك بعرض الورك والبار فوق منتصف قدميك، وأمسكه خارج ركبتيك مباشرة.\n2. اثنِ ركبتيك حتى تلامس ساقاك البار مع إبقاء ظهرك مستقيمًا وصدرك مرفوعًا.\n3. خذ نفسًا عميقًا وشد عضلات البطن، وادفع بكعبيك لرفع البار مع إبقائه قريبًا من جسمك.\n4. مدّ وركيك وركبتيك معًا حتى تقف منتصبًا تمامًا.\n5. اعكس الحركة بتحكم لإنزال البار إلى الأرض، وأعد ضبط وضعيتك قبل كل تكرار.",
    commonMistakes:
      "Rounding the lower back under load is the most dangerous mistake and greatly increases injury risk. Letting the bar drift away from the shins forces the lower back to compensate, and jerking the bar off the floor instead of building tension first often causes form breakdown.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["romanian-deadlift", "barbell-row", "barbell-back-squat"],
  },
  {
    name: "Pull-Up",
    nameAr: "العقلة",
    slug: "pull-up",
    muscleGroup: "Back",
    secondaryMuscles: ["Arms", "Shoulders"],
    difficulty: "INTERMEDIATE",
    equipment: "Pull-up Bar",
    instructions:
      "1. Grip the bar slightly wider than shoulder-width with palms facing away from you and hang with arms fully extended.\n2. Engage your shoulder blades by pulling them down and back before initiating the pull.\n3. Pull your body up by driving your elbows toward the floor until your chin clears the bar.\n4. Pause briefly at the top, then lower yourself with control back to a full hang.\n5. Repeat for the desired number of reps without swinging your legs for momentum.",
    instructionsAr:
      "1. أمسك البار بقبضة أوسع قليلاً من عرض الكتفين وكفاك متجهتان للخارج، وتدلَّ بذراعين مستقيمتين تمامًا.\n2. اسحب لوحي كتفك للأسفل وللخلف قبل بدء حركة السحب.\n3. اسحب جسمك للأعلى بدفع مرفقيك نحو الأرض حتى يتجاوز ذقنك مستوى البار.\n4. توقف لحظة في الأعلى، ثم انزل بتحكم إلى وضع التعليق الكامل.\n5. كرر الحركة للعدد المطلوب دون تأرجح الساقين لاكتساب زخم.",
    commonMistakes:
      "Using momentum by kipping or swinging the body turns the pull-up into a different exercise entirely. Not achieving a full range of motion — stopping short of a full hang or not pulling the chin over the bar — limits back development, and shrugging the shoulders up toward the ears reduces lat engagement.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["lat-pulldown", "barbell-row", "seated-cable-row"],
  },
  {
    name: "Barbell Bent-Over Row",
    nameAr: "تجديف البار منحنيًا",
    slug: "barbell-row",
    muscleGroup: "Back",
    secondaryMuscles: ["Arms", "Shoulders"],
    difficulty: "INTERMEDIATE",
    equipment: "Barbell",
    instructions:
      "1. Stand with feet shoulder-width apart, hinge at the hips until your torso is roughly 45 degrees to the floor, and hold the bar with an overhand grip.\n2. Keep your back flat and knees slightly bent throughout the movement.\n3. Pull the bar toward your lower ribcage, driving your elbows up and back.\n4. Squeeze your shoulder blades together at the top of the movement.\n5. Lower the bar under control back to the starting hang and repeat.",
    instructionsAr:
      "1. قف وقدماك بعرض الكتفين، وانحنِ من الوركين حتى يصبح جذعك بزاوية 45 درجة تقريبًا من الأرض، وأمسك البار بقبضة علوية.\n2. أبقِ ظهرك مستقيمًا وركبتيك مثنيتين قليلاً طوال الحركة.\n3. اسحب البار نحو أسفل قفصك الصدري بدفع مرفقيك للأعلى وللخلف.\n4. اضغط لوحي كتفك معًا عند ذروة الحركة.\n5. أنزل البار بتحكم إلى وضع البداية وكرر الحركة.",
    commonMistakes:
      "Standing too upright turns the row into a shrug rather than targeting the back. Using excessive momentum by jerking the torso up on each rep reduces muscle tension, and rounding the lower back under load increases injury risk.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["seated-cable-row", "pull-up", "deadlift"],
  },
  {
    name: "Lat Pulldown",
    nameAr: "سحب أمامي للظهر",
    slug: "lat-pulldown",
    muscleGroup: "Back",
    secondaryMuscles: ["Arms", "Shoulders"],
    difficulty: "BEGINNER",
    equipment: "Cable Machine",
    instructions:
      "1. Sit at the lat pulldown machine and secure your thighs under the pad, gripping the bar slightly wider than shoulder-width.\n2. Lean back slightly and pull the bar down toward your upper chest, leading with your elbows.\n3. Squeeze your shoulder blades together as the bar reaches your chest.\n4. Pause briefly, then let the bar rise back up with control until your arms are fully extended.\n5. Repeat for the desired number of reps without using your body weight to yank the bar down.",
    instructionsAr:
      "1. اجلس على جهاز السحب الأمامي وثبّت فخذيك تحت الوسادة، وأمسك البار بقبضة أوسع قليلاً من عرض الكتفين.\n2. مِل للخلف قليلاً واسحب البار نحو أعلى صدرك مع قيادة الحركة بمرفقيك.\n3. اضغط لوحي كتفك معًا عندما يصل البار إلى صدرك.\n4. توقف لحظة، ثم اترك البار يرتفع ببطء وتحكم حتى تستقيم ذراعاك بالكامل.\n5. كرر الحركة للعدد المطلوب دون استخدام وزن جسمك لجذب البار للأسفل.",
    commonMistakes:
      "Leaning back excessively turns the movement into a row instead of a vertical pull. Pulling the bar behind the neck can strain the shoulder joint, and using momentum instead of controlled lat engagement reduces the exercise's effectiveness.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["pull-up", "seated-cable-row", "barbell-row"],
  },
  {
    name: "Seated Cable Row",
    nameAr: "التجديف الجالس بالكابل",
    slug: "seated-cable-row",
    muscleGroup: "Back",
    secondaryMuscles: ["Arms", "Shoulders"],
    difficulty: "BEGINNER",
    equipment: "Cable Machine",
    instructions:
      "1. Sit at the cable row station with knees slightly bent and feet braced against the platform, holding the handle with arms extended.\n2. Sit up tall with a neutral spine before initiating the pull.\n3. Pull the handle toward your lower abdomen, driving your elbows straight back.\n4. Squeeze your shoulder blades together at the end range of the pull.\n5. Extend your arms back out with control to fully stretch the lats and repeat.",
    instructionsAr:
      "1. اجلس عند جهاز التجديف بالكابل مع ثني بسيط في الركبتين وتثبيت قدميك على المنصة، وأمسك المقبض بذراعين ممدودتين.\n2. اجلس منتصبًا مع الحفاظ على استقامة العمود الفقري قبل بدء السحب.\n3. اسحب المقبض نحو أسفل بطنك بدفع مرفقيك للخلف مباشرة.\n4. اضغط لوحي كتفك معًا عند نهاية مدى السحب.\n5. مدّ ذراعيك للخارج بتحكم لتمديد عضلات الظهر بالكامل وكرر الحركة.",
    commonMistakes:
      "Rounding the back to reach further at the start compromises spinal safety. Leaning too far back and using body momentum to move the weight reduces back activation, and shrugging the shoulders instead of driving the elbows back limits lat recruitment.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["lat-pulldown", "barbell-row", "pull-up"],
  },

  // ── Legs ───────────────────────────────────────────────────────────────
  {
    name: "Barbell Back Squat",
    nameAr: "القرفصاء بالبار الخلفي",
    slug: "barbell-back-squat",
    muscleGroup: "Legs",
    secondaryMuscles: ["Core", "Glutes"],
    difficulty: "ADVANCED",
    equipment: "Barbell",
    instructions:
      "1. Position the bar across your upper back (not your neck) and stand with feet shoulder-width apart.\n2. Brace your core and unrack the bar, taking a step back to a stable stance.\n3. Bend your knees and hips to descend, keeping your chest up and knees tracking over your toes.\n4. Lower until your hips drop just below knee level, or as deep as mobility allows with good form.\n5. Drive through your whole foot to stand back up, extending your hips and knees together.",
    instructionsAr:
      "1. ضع البار على أعلى ظهرك (وليس على رقبتك) وقف وقدماك بعرض الكتفين.\n2. شد عضلات بطنك وارفع البار من الحامل، وتراجع خطوة للخلف حتى تستقر في وضعية ثابتة.\n3. اثنِ ركبتيك ووركيك للنزول، مع إبقاء صدرك مرفوعًا وركبتيك في اتجاه أصابع قدميك.\n4. انزل حتى يصبح وركك أسفل مستوى الركبة قليلًا، أو بأقصى عمق تسمح به مرونتك مع الحفاظ على الوضعية الصحيحة.\n5. ادفع بكامل قدمك للوقوف مجددًا مع مد وركيك وركبتيك معًا.",
    commonMistakes:
      "Letting the knees cave inward under load places dangerous stress on the knee joints. Rounding the lower back at the bottom of the squat (often called \"butt wink\") can injure the spine, and rising onto the toes instead of driving through the whole foot reduces stability and power.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["romanian-deadlift", "leg-press", "walking-lunge"],
  },
  {
    name: "Romanian Deadlift",
    nameAr: "الرفعة الميتة الرومانية",
    slug: "romanian-deadlift",
    muscleGroup: "Legs",
    secondaryMuscles: ["Back", "Glutes"],
    difficulty: "INTERMEDIATE",
    equipment: "Barbell",
    instructions:
      "1. Stand holding the bar at hip level with a shoulder-width grip and feet hip-width apart.\n2. Keeping a slight bend in your knees, hinge at the hips and push them back as you lower the bar down the front of your legs.\n3. Keep your back flat and the bar close to your legs throughout the descent.\n4. Lower until you feel a strong stretch in your hamstrings, typically around shin level.\n5. Drive your hips forward to return to standing, squeezing your glutes at the top.",
    instructionsAr:
      "1. قف ممسكًا بالبار عند مستوى الورك بقبضة بعرض الكتفين وقدمين بعرض الورك.\n2. مع الحفاظ على ثني بسيط في الركبتين، انحنِ من الوركين وادفعهما للخلف أثناء إنزال البار أمام ساقيك.\n3. أبقِ ظهرك مستقيمًا والبار قريبًا من ساقيك طوال حركة النزول.\n4. انزل حتى تشعر بتمدد قوي في أوتار الركبة، عادة عند مستوى قريب من الساق.\n5. ادفع وركيك للأمام للعودة للوقوف مع الضغط على عضلات الأرداف في الأعلى.",
    commonMistakes:
      "Bending the knees too much turns the movement into a squat rather than a hip hinge. Rounding the back to reach lower than hamstring flexibility allows risks injury, and letting the bar drift away from the legs increases strain on the lower back.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["deadlift", "leg-curl", "barbell-back-squat"],
  },
  {
    name: "Walking Lunge",
    nameAr: "الاندفاع أثناء المشي",
    slug: "walking-lunge",
    muscleGroup: "Legs",
    secondaryMuscles: ["Glutes", "Core"],
    difficulty: "BEGINNER",
    equipment: "Dumbbell",
    instructions:
      "1. Stand tall holding a dumbbell in each hand at your sides, or with just body weight.\n2. Step forward with one leg and lower your body until both knees form roughly 90-degree angles.\n3. Keep your front knee over your ankle and your torso upright.\n4. Push through your front heel to bring your back leg forward into the next step, rather than stepping backward.\n5. Continue alternating legs for the desired number of steps, keeping your core braced throughout.",
    instructionsAr:
      "1. قف منتصبًا ممسكًا بدمبل في كل يد على جانبيك، أو دون أوزان.\n2. تقدم بخطوة للأمام بإحدى ساقيك وانزل حتى تشكل الركبتان زاوية 90 درجة تقريبًا.\n3. أبقِ ركبتك الأمامية فوق كاحلك وجذعك منتصبًا.\n4. ادفع بكعبك الأمامي لتقديم ساقك الخلفية للخطوة التالية بدلًا من الرجوع للخلف.\n5. استمر بالتبديل بين الساقين للعدد المطلوب من الخطوات مع شد عضلات البطن طوال التمرين.",
    commonMistakes:
      "Letting the front knee cave inward or travel far past the toes increases strain on the knee joint. Taking steps that are too short forces a bouncing, unstable motion, and leaning the torso too far forward shifts unwanted load onto the lower back.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-back-squat", "leg-press", "bodyweight-squat"],
  },
  {
    name: "Leg Press",
    nameAr: "ضغط الأرجل بالجهاز",
    slug: "leg-press",
    muscleGroup: "Legs",
    secondaryMuscles: ["Glutes"],
    difficulty: "BEGINNER",
    equipment: "Machine",
    instructions:
      "1. Sit in the leg press machine and place your feet shoulder-width apart on the platform.\n2. Release the safety catches and lower the platform by bending your knees toward your chest.\n3. Lower until your knees reach about a 90-degree angle without letting your lower back lift off the pad.\n4. Press through your heels to extend your legs back to the starting position without locking your knees hard.\n5. Repeat for the desired number of reps, controlling the negative on each rep.",
    instructionsAr:
      "1. اجلس في جهاز ضغط الأرجل وضع قدميك بعرض الكتفين على المنصة.\n2. حرر مزلاج الأمان وأنزل المنصة بثني ركبتيك نحو صدرك.\n3. انزل حتى تصل الركبتان إلى زاوية 90 درجة تقريبًا دون رفع أسفل ظهرك عن الوسادة.\n4. ادفع بكعبيك لمد ساقيك والعودة إلى وضع البداية دون قفل الركبتين بقوة.\n5. كرر الحركة للعدد المطلوب مع التحكم في مرحلة النزول في كل تكرار.",
    commonMistakes:
      "Lowering the platform so far that the lower back rounds off the pad puts the spine at risk. Locking the knees out forcefully at the top can strain the joint, and placing the feet too low on the platform shifts excessive stress onto the knees.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-back-squat", "walking-lunge", "leg-curl"],
  },
  {
    name: "Lying Leg Curl",
    nameAr: "ثني الرجل بجهاز الاستلقاء",
    slug: "leg-curl",
    muscleGroup: "Legs",
    secondaryMuscles: ["Glutes"],
    difficulty: "BEGINNER",
    equipment: "Machine",
    instructions:
      "1. Lie face down on the leg curl machine with the pad positioned just above your heels.\n2. Grip the handles for stability and keep your hips pressed flat against the bench.\n3. Curl your heels toward your glutes by contracting your hamstrings.\n4. Pause briefly at the top of the contraction.\n5. Lower the weight back down with control to a full stretch and repeat.",
    instructionsAr:
      "1. استلقِ على وجهك على جهاز ثني الرجل بحيث تكون الوسادة فوق كعبيك مباشرة.\n2. أمسك المقابض للثبات وأبقِ وركيك مضغوطين على المقعد.\n3. اثنِ كعبيك نحو أردافك بتقلص عضلات أوتار الركبة.\n4. توقف لحظة عند ذروة الانقباض.\n5. أنزل الوزن ببطء وتحكم للحصول على تمدد كامل وكرر الحركة.",
    commonMistakes:
      "Lifting the hips off the bench to generate momentum reduces hamstring isolation. Using too heavy a weight often results in only a partial range of motion, and swinging the legs instead of a controlled squeeze diminishes the training effect.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["romanian-deadlift", "leg-press", "walking-lunge"],
  },
  {
    name: "Standing Calf Raise",
    nameAr: "رفع السمانة واقفًا",
    slug: "calf-raise",
    muscleGroup: "Legs",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Machine",
    instructions:
      "1. Stand on the calf raise machine with the balls of your feet on the platform and shoulders under the pads.\n2. Lower your heels below the platform edge to feel a full stretch in your calves.\n3. Press through the balls of your feet to rise as high as possible onto your toes.\n4. Squeeze your calves hard at the top for a brief pause.\n5. Lower back down with control and repeat for the desired number of reps.",
    instructionsAr:
      "1. قف على جهاز رفع السمانة بحيث تكون مقدمة قدميك على المنصة وكتفاك تحت الوسادتين.\n2. أنزل كعبيك أسفل حافة المنصة لتشعر بتمدد كامل في عضلات السمانة.\n3. ادفع بمقدمة قدميك للارتفاع لأعلى نقطة ممكنة على أطراف أصابعك.\n4. اضغط على عضلات السمانة بقوة لحظة في الأعلى.\n5. انزل ببطء وتحكم وكرر الحركة للعدد المطلوب.",
    commonMistakes:
      "Using short, bouncy reps instead of a full range of motion limits calf development. Bending the knees during the movement shifts emphasis away from the calves, and rushing through reps without pausing at the top sacrifices peak contraction.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["leg-press", "walking-lunge", "bodyweight-squat"],
  },
  {
    name: "Bodyweight Squat",
    nameAr: "القرفصاء بوزن الجسم",
    slug: "bodyweight-squat",
    muscleGroup: "Legs",
    secondaryMuscles: ["Glutes", "Core"],
    difficulty: "BEGINNER",
    equipment: "Bodyweight",
    instructions:
      "1. Stand with feet shoulder-width apart and toes pointed slightly outward.\n2. Extend your arms forward for balance and brace your core.\n3. Bend your knees and push your hips back to lower into a squat, keeping your chest up.\n4. Descend until your thighs are roughly parallel to the floor, or as low as your mobility allows.\n5. Drive through your heels to return to standing and repeat.",
    instructionsAr:
      "1. قف وقدماك بعرض الكتفين وأصابع قدميك متجهة للخارج قليلاً.\n2. مد ذراعيك للأمام للحفاظ على التوازن وشد عضلات بطنك.\n3. اثنِ ركبتيك وادفع وركيك للخلف للنزول في وضعية القرفصاء مع إبقاء صدرك مرفوعًا.\n4. انزل حتى تصبح فخذاك موازيتين تقريبًا للأرض، أو بأقصى عمق تسمح به مرونتك.\n5. ادفع بكعبيك للعودة للوقوف وكرر الحركة.",
    commonMistakes:
      "Letting the knees collapse inward reduces stability and stresses the joints. Rising onto the toes instead of keeping weight through the heels indicates poor ankle mobility or balance, and rounding the lower back at the bottom of the squat should be avoided.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["walking-lunge", "glute-bridge", "leg-press"],
  },
  {
    name: "Glute Bridge",
    nameAr: "جسر الأرداف",
    slug: "glute-bridge",
    muscleGroup: "Legs",
    secondaryMuscles: ["Core"],
    difficulty: "BEGINNER",
    equipment: "Bodyweight",
    instructions:
      "1. Lie on your back with knees bent, feet flat on the floor hip-width apart, and arms at your sides.\n2. Brace your core and press through your heels to lift your hips off the floor.\n3. Continue raising until your body forms a straight line from shoulders to knees.\n4. Squeeze your glutes hard at the top of the movement for a brief pause.\n5. Lower your hips back down with control and repeat.",
    instructionsAr:
      "1. استلقِ على ظهرك مع ثني ركبتيك وقدميك مسطحتين على الأرض بعرض الورك، وذراعاك على جانبيك.\n2. شد عضلات بطنك وادفع بكعبيك لرفع وركيك عن الأرض.\n3. استمر بالرفع حتى يشكل جسمك خطًا مستقيمًا من الكتفين حتى الركبتين.\n4. اضغط على عضلات الأرداف بقوة عند ذروة الحركة لحظة قصيرة.\n5. أنزل وركيك ببطء وتحكم وكرر الحركة.",
    commonMistakes:
      "Overarching the lower back instead of using the glutes to lift shifts strain to the spine. Not raising the hips high enough leaves the glutes under-engaged, and letting the knees fall outward or inward reduces stability and effectiveness.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["bodyweight-squat", "romanian-deadlift", "walking-lunge"],
  },

  // ── Shoulders ──────────────────────────────────────────────────────────
  {
    name: "Barbell Overhead Press",
    nameAr: "الضغط العلوي بالبار",
    slug: "overhead-press",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Arms", "Core"],
    difficulty: "INTERMEDIATE",
    equipment: "Barbell",
    instructions:
      "1. Stand with feet shoulder-width apart, holding the bar at shoulder height with an overhand grip just outside your shoulders.\n2. Brace your core and squeeze your glutes to keep your torso stable.\n3. Press the bar straight overhead, moving your head slightly back to let the bar pass, then forward again once it clears.\n4. Fully extend your arms with the bar directly over your shoulders and ears.\n5. Lower the bar back to shoulder height with control and repeat.",
    instructionsAr:
      "1. قف وقدماك بعرض الكتفين، ممسكًا بالبار عند مستوى الكتفين بقبضة علوية خارج كتفيك مباشرة.\n2. شد عضلات بطنك واضغط على أردافك للحفاظ على ثبات الجذع.\n3. ادفع البار مباشرة للأعلى، مع تحريك رأسك للخلف قليلاً لتمرير البار ثم للأمام مجددًا بعد تجاوزه.\n4. مدّ ذراعيك بالكامل بحيث يكون البار فوق كتفيك وأذنيك مباشرة.\n5. أنزل البار إلى مستوى الكتفين بتحكم وكرر الحركة.",
    commonMistakes:
      "Arching the lower back excessively to press the weight up compensates for weak shoulder strength and risks injury. Pressing the bar forward instead of straight up reduces efficiency, and failing to brace the core allows the ribcage to flare and destabilizes the lift.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["lateral-raise", "face-pull", "close-grip-bench-press"],
  },
  {
    name: "Dumbbell Lateral Raise",
    nameAr: "الرفع الجانبي بالدمبل",
    slug: "lateral-raise",
    muscleGroup: "Shoulders",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Dumbbell",
    instructions:
      "1. Stand tall holding a dumbbell in each hand at your sides with a slight bend in your elbows.\n2. Raise both arms out to the sides simultaneously until they reach shoulder height.\n3. Keep the movement slow and controlled, leading with your elbows rather than your hands.\n4. Pause briefly at the top without shrugging your shoulders toward your ears.\n5. Lower the dumbbells back down with control and repeat.",
    instructionsAr:
      "1. قف منتصبًا ممسكًا بدمبل في كل يد على جانبيك مع ثني بسيط في المرفقين.\n2. ارفع ذراعيك للجانبين في آن واحد حتى يصلا إلى مستوى الكتفين.\n3. حافظ على حركة بطيئة ومتحكم بها، مع قيادة الحركة بمرفقيك بدلًا من يديك.\n4. توقف لحظة في الأعلى دون رفع كتفيك نحو أذنيك.\n5. أنزل الدمبل ببطء وتحكم وكرر الحركة.",
    commonMistakes:
      "Using momentum to swing the weights up rather than lifting with the shoulder muscles reduces effectiveness. Raising the arms above shoulder height shifts stress onto the traps, and shrugging the shoulders throughout the set indicates the weight is too heavy.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["rear-delt-fly", "face-pull", "overhead-press"],
  },
  {
    name: "Rear Delt Fly",
    nameAr: "فتح الكتف الخلفي",
    slug: "rear-delt-fly",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Back"],
    difficulty: "BEGINNER",
    equipment: "Dumbbell",
    instructions:
      "1. Hinge forward at the hips with a flat back, holding a dumbbell in each hand hanging below your shoulders.\n2. Keep a slight bend in your elbows throughout the movement.\n3. Raise your arms out to the sides in an arcing motion, squeezing your shoulder blades together.\n4. Pause briefly when your arms are in line with your torso.\n5. Lower the dumbbells back down with control and repeat.",
    instructionsAr:
      "1. انحنِ من الوركين بظهر مستقيم، ممسكًا بدمبل في كل يد متدليًا تحت كتفيك.\n2. أبقِ ثنيًا بسيطًا في مرفقيك طوال الحركة.\n3. ارفع ذراعيك للجانبين في مسار قوسي مع الضغط على لوحي الكتف معًا.\n4. توقف لحظة عندما تصبح ذراعاك في خط مستقيم مع جذعك.\n5. أنزل الدمبل ببطء وتحكم وكرر الحركة.",
    commonMistakes:
      "Rounding the back while bent over shifts stress onto the spine instead of the shoulders. Using too much weight often causes the movement to turn into a row, and rising the torso up during each rep reduces tension on the rear deltoids.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["face-pull", "lateral-raise", "seated-cable-row"],
  },
  {
    name: "Face Pull",
    nameAr: "السحب نحو الوجه",
    slug: "face-pull",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Back"],
    difficulty: "BEGINNER",
    equipment: "Cable Machine",
    instructions:
      "1. Attach a rope handle to a cable set at upper-chest to head height and grip it with both hands, palms facing in.\n2. Step back to create tension and stand tall with a slight lean back.\n3. Pull the rope toward your face, separating your hands as you pull so your elbows flare out wide.\n4. Aim to finish with your hands beside your ears and your shoulder blades squeezed together.\n5. Return to the start with control and repeat.",
    instructionsAr:
      "1. ثبّت مقبض الحبل على كابل مضبوط بين ارتفاع الصدر العلوي والرأس وأمسكه بكلتا يديك مع اتجاه الكفين للداخل.\n2. تراجع خطوة لخلق توتر وقف منتصبًا مع ميل بسيط للخلف.\n3. اسحب الحبل نحو وجهك مع فصل يديك أثناء السحب بحيث تتباعد مرفقاك للخارج.\n4. اهدف لإنهاء الحركة بيديك بجانب أذنيك ولوحي كتفك مضغوطين معًا.\n5. عد إلى وضع البداية بتحكم وكرر الحركة.",
    commonMistakes:
      "Using too much weight forces the lifter to lean back excessively and use body momentum. Pulling straight to the chest instead of the face turns it into a row and neglects the rear delts, and failing to flare the elbows wide reduces external rotation benefits.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["rear-delt-fly", "lateral-raise", "seated-cable-row"],
  },

  // ── Arms ───────────────────────────────────────────────────────────────
  {
    name: "Barbell Curl",
    nameAr: "تجعيد الذراع بالبار",
    slug: "barbell-curl",
    muscleGroup: "Arms",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Barbell",
    instructions:
      "1. Stand tall holding a barbell with an underhand grip, shoulder-width apart, arms fully extended.\n2. Keep your elbows pinned to your sides throughout the movement.\n3. Curl the bar upward by contracting your biceps, without swinging your torso.\n4. Squeeze your biceps at the top of the movement.\n5. Lower the bar back down with control to full arm extension and repeat.",
    instructionsAr:
      "1. قف منتصبًا ممسكًا بالبار بقبضة سفلية بعرض الكتفين وذراعان ممدودتان بالكامل.\n2. أبقِ مرفقيك ثابتين بجانب جسمك طوال الحركة.\n3. اثنِ البار للأعلى بتقلص عضلة الباي، دون تأرجح الجذع.\n4. اضغط على عضلة الباي عند ذروة الحركة.\n5. أنزل البار ببطء وتحكم حتى تمتد الذراع بالكامل وكرر الحركة.",
    commonMistakes:
      "Swinging the torso to heave the weight up uses momentum instead of the biceps. Letting the elbows drift forward reduces the range of motion, and only performing partial reps near the top limits full muscle development.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["hammer-curl", "close-grip-bench-press", "triceps-pushdown"],
  },
  {
    name: "Hammer Curl",
    nameAr: "تجعيد المطرقة",
    slug: "hammer-curl",
    muscleGroup: "Arms",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Dumbbell",
    instructions:
      "1. Stand tall holding a dumbbell in each hand at your sides with palms facing your torso.\n2. Keep your elbows tucked close to your body throughout the movement.\n3. Curl the dumbbells up while maintaining the neutral, palms-in grip until they reach shoulder height.\n4. Squeeze your forearms and biceps briefly at the top.\n5. Lower the dumbbells back down with control and repeat, alternating or moving both arms together.",
    instructionsAr:
      "1. قف منتصبًا ممسكًا بدمبل في كل يد على جانبيك مع اتجاه الكفين نحو الجذع.\n2. أبقِ مرفقيك قريبين من جسمك طوال الحركة.\n3. اثنِ الدمبل للأعلى مع الحفاظ على القبضة المحايدة (الكفان متجهان للداخل) حتى يصلا إلى مستوى الكتفين.\n4. اضغط على عضلات الساعد والباي لحظة في الأعلى.\n5. أنزل الدمبل ببطء وتحكم وكرر الحركة، سواء بالتناوب أو بكلتا اليدين معًا.",
    commonMistakes:
      "Swinging the shoulders and torso to lift heavier weight reduces isolation of the target muscles. Letting the elbows flare away from the torso changes the movement pattern, and rushing the eccentric (lowering) phase forfeits muscle growth benefits.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["barbell-curl", "triceps-pushdown", "close-grip-bench-press"],
  },
  {
    name: "Triceps Pushdown",
    nameAr: "دفع الترايسبس بالكابل",
    slug: "triceps-pushdown",
    muscleGroup: "Arms",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Cable Machine",
    instructions:
      "1. Attach a straight or angled bar to a high pulley and grip it with hands shoulder-width apart.\n2. Pin your elbows to your sides and keep them stationary throughout the set.\n3. Push the bar down by extending your elbows until your arms are fully straight.\n4. Squeeze your triceps hard at the bottom of the movement.\n5. Let the bar rise back up with control to about 90 degrees at the elbow and repeat.",
    instructionsAr:
      "1. ثبّت قضيبًا مستقيمًا أو مائلًا على بكرة علوية وأمسكه بيدين بعرض الكتفين.\n2. ثبّت مرفقيك بجانب جسمك وأبقهما ثابتين طوال المجموعة.\n3. ادفع القضيب للأسفل بمد مرفقيك حتى تستقيم ذراعاك بالكامل.\n4. اضغط على عضلة الترايسبس بقوة عند أسفل الحركة.\n5. اترك القضيب يرتفع ببطء وتحكم حتى زاوية 90 درجة تقريبًا في المرفق وكرر الحركة.",
    commonMistakes:
      "Letting the elbows drift forward or away from the torso turns the movement into more of a shoulder press. Using body weight by leaning into the cable reduces triceps isolation, and not fully extending the arms at the bottom shortens the effective range of motion.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["close-grip-bench-press", "hammer-curl", "barbell-curl"],
  },
  {
    name: "Close-Grip Bench Press",
    nameAr: "ضغط البنش بقبضة ضيقة",
    slug: "close-grip-bench-press",
    muscleGroup: "Arms",
    secondaryMuscles: ["Chest", "Shoulders"],
    difficulty: "INTERMEDIATE",
    equipment: "Barbell",
    instructions:
      "1. Lie flat on the bench and grip the bar with hands about shoulder-width apart, closer than a standard bench press.\n2. Unrack the bar and hold it steady above your chest with arms extended.\n3. Lower the bar with control to your lower chest, keeping your elbows tucked close to your torso.\n4. Press the bar back up by extending your elbows, focusing on driving through your triceps.\n5. Repeat for the desired number of reps, keeping the wrists stacked directly over the elbows.",
    instructionsAr:
      "1. استلقِ على المقعد وأمسك البار بيدين بعرض الكتفين تقريبًا، أضيق من قبضة ضغط البنش المعتادة.\n2. ارفع البار من الحامل وثبّته فوق صدرك بذراعين ممدودتين.\n3. أنزل البار بتحكم نحو أسفل صدرك مع إبقاء مرفقيك قريبين من جذعك.\n4. ادفع البار للأعلى بمد مرفقيك مع التركيز على الدفع بعضلة الترايسبس.\n5. كرر الحركة للعدد المطلوب مع إبقاء المعصمين فوق المرفقين مباشرة.",
    commonMistakes:
      "Gripping too narrow can place undue stress on the wrists, so a moderate shoulder-width grip is safest. Flaring the elbows out wide shifts emphasis back to the chest instead of the triceps, and bouncing the bar off the chest reduces control and increases injury risk.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["triceps-pushdown", "barbell-bench-press", "barbell-curl"],
  },

  // ── Core ───────────────────────────────────────────────────────────────
  {
    name: "Plank",
    nameAr: "تمرين البلانك",
    slug: "plank",
    muscleGroup: "Core",
    secondaryMuscles: ["Shoulders"],
    difficulty: "BEGINNER",
    equipment: "Bodyweight",
    instructions:
      "1. Position your forearms on the floor with elbows directly under your shoulders and legs extended behind you.\n2. Rise onto your toes so your body forms a straight line from head to heels.\n3. Brace your core and squeeze your glutes to prevent your hips from sagging or piking up.\n4. Keep your neck neutral by looking at a spot on the floor just ahead of your hands.\n5. Hold this position for the desired duration while breathing steadily.",
    instructionsAr:
      "1. ضع ساعديك على الأرض بحيث يكون مرفقاك أسفل كتفيك مباشرة وساقاك ممدودتان خلفك.\n2. ارتفع على أطراف أصابع قدميك بحيث يشكل جسمك خطًا مستقيمًا من الرأس حتى الكعبين.\n3. شد عضلات بطنك واضغط على أردافك لمنع هبوط أو ارتفاع الوسط.\n4. أبقِ رقبتك في وضع محايد بالنظر إلى نقطة على الأرض أمام يديك مباشرة.\n5. حافظ على هذه الوضعية للمدة المطلوبة مع التنفس بشكل منتظم.",
    commonMistakes:
      "Letting the hips sag toward the floor places excessive strain on the lower back. Piking the hips up too high reduces core engagement, and holding your breath instead of breathing steadily causes unnecessary tension and fatigue.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["hanging-leg-raise", "cable-crunch", "russian-twist"],
  },
  {
    name: "Hanging Leg Raise",
    nameAr: "رفع الساقين معلقًا",
    slug: "hanging-leg-raise",
    muscleGroup: "Core",
    secondaryMuscles: ["Arms"],
    difficulty: "INTERMEDIATE",
    equipment: "Pull-up Bar",
    instructions:
      "1. Hang from a pull-up bar with an overhand grip, arms fully extended and legs straight.\n2. Engage your core and avoid swinging before starting the movement.\n3. Raise your legs together, keeping them straight or slightly bent, until they reach at least hip height.\n4. Pause briefly at the top and focus on contracting your lower abs.\n5. Lower your legs back down with control and repeat without using momentum.",
    instructionsAr:
      "1. تدلَّ من عارضة العقلة بقبضة علوية، ذراعان ممدودتان بالكامل وساقان مستقيمتان.\n2. شد عضلات بطنك وتجنب التأرجح قبل بدء الحركة.\n3. ارفع ساقيك معًا، مستقيمتين أو مثنيتين قليلاً، حتى تصلا إلى مستوى الورك على الأقل.\n4. توقف لحظة في الأعلى وركز على تقلص عضلات البطن السفلية.\n5. أنزل ساقيك ببطء وتحكم وكرر الحركة دون استخدام الزخم.",
    commonMistakes:
      "Swinging the body to generate momentum turns the exercise into a test of grip rather than core strength. Using very bent knees throughout removes much of the challenge, and arching the lower back at the top instead of curling the pelvis reduces ab activation.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["cable-crunch", "plank", "russian-twist"],
  },
  {
    name: "Cable Crunch",
    nameAr: "تمرين الطحن بالكابل",
    slug: "cable-crunch",
    muscleGroup: "Core",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Cable Machine",
    instructions:
      "1. Kneel below a high pulley and hold a rope attachment with both hands beside your head.\n2. Sit back onto your heels slightly with your hips stationary throughout the movement.\n3. Curl your torso downward by contracting your abs, bringing your elbows toward your knees.\n4. Squeeze your abs hard at the bottom of the movement.\n5. Slowly return to the starting position with control, keeping tension on the abs, and repeat.",
    instructionsAr:
      "1. اركع تحت بكرة علوية وأمسك مقبض الحبل بكلتا يديك بجانب رأسك.\n2. اجلس قليلاً على كعبيك مع إبقاء وركيك ثابتين طوال الحركة.\n3. اثنِ جذعك للأسفل بتقلص عضلات البطن، مع تقريب مرفقيك من ركبتيك.\n4. اضغط على عضلات البطن بقوة عند أسفل الحركة.\n5. عد ببطء إلى وضع البداية بتحكم مع إبقاء التوتر على عضلات البطن، وكرر الحركة.",
    commonMistakes:
      "Using the hip flexors by moving the hips instead of curling the spine reduces ab isolation. Pulling with the arms rather than contracting the abs turns it into a lat exercise, and using too much weight often shortens the range of motion.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["hanging-leg-raise", "plank", "russian-twist"],
  },
  {
    name: "Russian Twist",
    nameAr: "اللف الروسي",
    slug: "russian-twist",
    muscleGroup: "Core",
    secondaryMuscles: [],
    difficulty: "BEGINNER",
    equipment: "Bodyweight",
    instructions:
      "1. Sit on the floor with knees bent and lean back slightly until your torso is at about a 45-degree angle.\n2. Lift your feet slightly off the floor for added difficulty, or keep them planted for a beginner variation.\n3. Clasp your hands together in front of your chest, or hold a weight if desired.\n4. Rotate your torso to one side, tapping the floor beside your hip, then rotate to the other side.\n5. Continue alternating sides for the desired number of reps while keeping your core braced.",
    instructionsAr:
      "1. اجلس على الأرض مع ثني ركبتيك ومِل للخلف قليلاً حتى يصبح جذعك بزاوية 45 درجة تقريبًا.\n2. ارفع قدميك قليلاً عن الأرض لزيادة الصعوبة، أو أبقهما ثابتتين لنسخة المبتدئين.\n3. اجمع يديك أمام صدرك، أو أمسك وزنًا إذا رغبت.\n4. لف جذعك نحو جانب واحد لملامسة الأرض بجانب وركك، ثم لف نحو الجانب الآخر.\n5. استمر بالتبديل بين الجانبين للعدد المطلوب من التكرارات مع شد عضلات البطن طوال التمرين.",
    commonMistakes:
      "Moving quickly with poor control turns the exercise into momentum-driven flailing rather than a controlled rotation. Rounding the lower back excessively while leaning back can strain the spine, and only rotating the arms without actually rotating the torso reduces oblique engagement.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["cable-crunch", "plank", "hanging-leg-raise"],
  },

  // ── Full Body / Cardio ────────────────────────────────────────────────
  {
    name: "Jumping Jack",
    nameAr: "تمرين نط الرجلين والذراعين",
    slug: "jumping-jack",
    muscleGroup: "Full Body",
    secondaryMuscles: ["Legs", "Shoulders"],
    difficulty: "BEGINNER",
    equipment: "None",
    instructions:
      "1. Stand tall with feet together and arms at your sides.\n2. Jump your feet out wide while simultaneously raising your arms overhead.\n3. Jump again to return your feet together and arms back down to your sides.\n4. Keep a light, quick rhythm and land softly on the balls of your feet.\n5. Continue for the desired duration or number of reps.",
    instructionsAr:
      "1. قف منتصبًا مع تقارب قدميك وذراعيك على جانبيك.\n2. اقفز مع فتح قدميك للخارج ورفع ذراعيك للأعلى في آن واحد.\n3. اقفز مجددًا لإعادة قدميك للتقارب وذراعيك للأسفل.\n4. حافظ على إيقاع خفيف وسريع واهبط برفق على أطراف أصابع قدميك.\n5. استمر للمدة أو العدد المطلوب من التكرارات.",
    commonMistakes:
      "Landing flat-footed with stiff knees increases impact stress on the joints. Moving too slowly reduces the cardiovascular benefit, and failing to fully raise the arms overhead shortchanges the shoulder range of motion.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["high-knees", "mountain-climber", "burpee"],
  },
  {
    name: "Mountain Climber",
    nameAr: "تسلق الجبل",
    slug: "mountain-climber",
    muscleGroup: "Full Body",
    secondaryMuscles: ["Core", "Legs"],
    difficulty: "BEGINNER",
    equipment: "Bodyweight",
    instructions:
      "1. Start in a high plank position with hands under your shoulders and body in a straight line.\n2. Brace your core to keep your hips level throughout the movement.\n3. Drive one knee toward your chest, then quickly switch legs in a running-like motion.\n4. Keep your hips low and avoid piking them up into the air.\n5. Continue alternating legs at a controlled or fast pace for the desired duration.",
    instructionsAr:
      "1. ابدأ بوضعية البلانك العالي مع يديك أسفل كتفيك مباشرة وجسمك في خط مستقيم.\n2. شد عضلات بطنك للحفاظ على استواء وركيك طوال الحركة.\n3. ادفع ركبة واحدة نحو صدرك، ثم بدّل الساقين بسرعة بحركة تشبه الجري.\n4. أبقِ وركيك منخفضين وتجنب رفعهما للأعلى.\n5. استمر بتبديل الساقين بوتيرة متحكم بها أو سريعة للمدة المطلوبة.",
    commonMistakes:
      "Letting the hips rise up into a pike reduces core engagement and turns it into a hip flexor stretch. Moving too fast with poor control causes the feet to barely tap the ground, and letting the lower back sag compromises spinal safety.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["burpee", "high-knees", "jumping-jack"],
  },
  {
    name: "Burpee",
    nameAr: "تمرين البيربي",
    slug: "burpee",
    muscleGroup: "Full Body",
    secondaryMuscles: ["Chest", "Legs", "Core"],
    difficulty: "INTERMEDIATE",
    equipment: "Bodyweight",
    instructions:
      "1. Start standing, then squat down and place your hands on the floor in front of you.\n2. Kick your feet back into a high plank position.\n3. Perform a push-up (optional for beginners), then jump your feet back up toward your hands.\n4. Explode upward into a jump, reaching your arms overhead.\n5. Land softly and immediately lower back into the next rep.",
    instructionsAr:
      "1. ابدأ واقفًا، ثم انزل بوضعية القرفصاء وضع يديك على الأرض أمامك.\n2. ارفس قدميك للخلف للوصول إلى وضعية البلانك العالي.\n3. نفّذ تمرين ضغط (اختياري للمبتدئين)، ثم اقفز بقدميك للعودة نحو يديك.\n4. اقفز للأعلى بقوة مع مد ذراعيك فوق رأسك.\n5. اهبط برفق وانتقل مباشرة إلى التكرار التالي.",
    commonMistakes:
      "Letting the hips sag during the plank phase strains the lower back. Rushing through the movement with sloppy form, especially during the jump back to the hands, increases the risk of missteps, and skipping the full jump at the top reduces the exercise's cardio and power benefits.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["mountain-climber", "jumping-jack", "high-knees"],
  },
  {
    name: "High Knees",
    nameAr: "رفع الركبتين العالي",
    slug: "high-knees",
    muscleGroup: "Full Body",
    secondaryMuscles: ["Legs", "Core"],
    difficulty: "BEGINNER",
    equipment: "None",
    instructions:
      "1. Stand tall with feet hip-width apart and arms bent at your sides as if running.\n2. Drive one knee up toward your chest as high as possible.\n3. Quickly switch legs, driving the opposite knee up while the first foot returns to the floor.\n4. Pump your arms in rhythm with your legs, staying light on your feet.\n5. Continue alternating at a quick pace for the desired duration.",
    instructionsAr:
      "1. قف منتصبًا وقدماك بعرض الورك وذراعاك مثنيتان على جانبيك كوضعية الجري.\n2. ادفع ركبة واحدة للأعلى نحو صدرك بأقصى ارتفاع ممكن.\n3. بدّل الساقين بسرعة، بدفع الركبة الأخرى للأعلى بينما تعود القدم الأولى إلى الأرض.\n4. حرّك ذراعيك بإيقاع متزامن مع ساقيك، مع البقاء خفيفًا على قدميك.\n5. استمر بالتبديل بوتيرة سريعة للمدة المطلوبة.",
    commonMistakes:
      "Leaning too far back reduces the height and power of the knee drive. Failing to bring the knees up to hip height turns the movement into light jogging in place, and landing heavily on flat feet increases joint impact.",
    imageUrl: null,
    videoUrl: null,
    animationUrl: null,
    alternativeSlugs: ["mountain-climber", "jumping-jack", "burpee"],
  },
];
