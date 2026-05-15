// shared.jsx — constants used across multiple modules
import { getC } from './theme.jsx';

// ── C ──
const C = getC();

// ── SUBJECTIVE_SECTIONS ──
const SUBJECTIVE_SECTIONS = {

  demographics: {
    label:"Patient Demographics", icon:"👤", color:"#00e5ff",
    fields:[
      { id:"dem_name",      label:"Full Name",             type:"text", placeholder:"Patient full name" },
      { id:"dem_dob",       label:"Date of Birth",         type:"text", placeholder:"DD/MM/YYYY" },
      { id:"dem_age",       label:"Age",                   type:"number", placeholder:"Years" },
      { id:"dem_sex",       label:"Biological Sex",        type:"select", options:["Male","Female","Intersex","Prefer not to say"] },
      { id:"dem_gender",    label:"Gender Identity",       type:"text", placeholder:"e.g. Male, Female, Non-binary" },
      { id:"dem_height",    label:"Height",                type:"text", placeholder:"e.g. 175cm / 5'9\"" },
      { id:"dem_weight",    label:"Weight",                type:"text", placeholder:"e.g. 75kg / 165lbs" },
      { id:"dem_bmi",       label:"BMI",                   type:"text", placeholder:"Auto-calculated or enter" },
      { id:"dem_dominant",  label:"Dominant Hand",         type:"select", options:["Right","Left","Ambidextrous"] },
      { id:"dem_dominant_foot", label:"Dominant Foot",     type:"select", options:["Right","Left"] },
      { id:"dem_ethnicity", label:"Ethnicity",             type:"text", placeholder:"Optional" },
      { id:"dem_language",  label:"Primary Language",      type:"text", placeholder:"e.g. English, Urdu" },
      { id:"dem_interpreter",label:"Interpreter Needed",   type:"select", options:["No","Yes — arranged","Yes — needed"] },
      { id:"dem_gp",        label:"GP / Referring Doctor", type:"text", placeholder:"Name and practice" },
      { id:"dem_referral",  label:"Referral Source",       type:"multicheck", options:["GP","Orthopaedic surgeon","Self-referral","Employer","Insurance","Sports coach","Another physio","A&E","Rheumatologist","Neurologist","Other specialist"] },
      { id:"dem_insurance",  label:"Insurance / Funding",  type:"multicheck", options:["NHS","Private — self pay","BUPA","AXA","Vitality","Aviva","WPA","Allianz","Employer EAP","Workers compensation","Motor accident","Other"] },
      { id:"dem_occupation",  label:"Occupation",          type:"text", placeholder:"Job title and employer" },
      { id:"dem_work_status", label:"Work Status",         type:"multicheck", options:["Full time employed","Part time employed","Self employed","Student","Retired","Unemployed","Off work — injury","Off work — illness","Carer","Volunteer"] },
      { id:"dem_notes",     label:"Additional Notes",      type:"textarea", placeholder:"Any other relevant demographic information" },
    ]
  },

  chief_complaint: {
    label:"Chief Complaint", icon:"🎯", color:"#ff4d6d",
    fields:[
      { id:"cc_main",         label:"Main Complaint (patient's words)", type:"textarea", placeholder:"Write exactly what the patient says is their main problem" },
      { id:"cc_location",     label:"Primary Pain Location",            type:"multicheck", options:["Head","Forehead","Temple (L)","Temple (R)","Occiput","Jaw/TMJ","Neck — anterior","Neck — posterior","Neck — lateral (L)","Neck — lateral (R)","Shoulder (L)","Shoulder (R)","Upper arm (L)","Upper arm (R)","Elbow (L)","Elbow (R)","Forearm (L)","Forearm (R)","Wrist (L)","Wrist (R)","Hand/fingers (L)","Hand/fingers (R)","Upper back","Mid back","Lower back","Sacrum","Coccyx","SI joint (L)","SI joint (R)","Buttock (L)","Buttock (R)","Groin (L)","Groin (R)","Hip (L)","Hip (R)","Thigh anterior (L)","Thigh anterior (R)","Thigh posterior (L)","Thigh posterior (R)","Knee (L)","Knee (R)","Lower leg (L)","Lower leg (R)","Ankle (L)","Ankle (R)","Foot (L)","Foot (R)","Plantar fascia (L)","Plantar fascia (R)","Toes (L)","Toes (R)"] },
      { id:"cc_secondary",    label:"Secondary Pain Location",          type:"text", placeholder:"Additional pain area if applicable" },
      { id:"cc_radiation",    label:"Pain Radiation / Referral",        type:"multicheck", options:["No radiation","Radiates to arm (L)","Radiates to arm (R)","Radiates to hand/fingers (L)","Radiates to hand/fingers (R)","Radiates to leg (L)","Radiates to leg (R)","Radiates to foot (L)","Radiates to foot (R)","Radiates across lower back","Radiates to groin","Radiates to buttock","Radiates to anterior thigh","Radiates to posterior thigh","Radiates to anterior shin","Radiates to calf","Radiates bilaterally","Radiates around chest/ribs","Radiates to jaw","Radiates to face","Bilateral upper limb symptoms","Bilateral lower limb symptoms"] },
      { id:"cc_symptom_type", label:"Symptom Type",                    type:"multicheck", options:["Pain","Aching","Stiffness","Burning","Tingling/pins & needles","Numbness","Sharp","Stabbing","Shooting","Throbbing","Cramping","Tightness","Weakness","Clicking","Grinding/crepitus","Locking","Giving way","Swelling","Warmth","Fatigue","Dizziness","Headache","Nausea"] },
      { id:"cc_onset",        label:"Onset",                           type:"multicheck", options:["Sudden — traumatic","Sudden — non-traumatic","Gradual — insidious","Gradual — after illness","Post-surgical","Post-partum","After change in activity","After new job/workstation","Woke up with it","No clear cause","Work-related","Sport-related","Motor vehicle accident","Slip/trip/fall","Lifting injury","Repetitive strain"] },
      { id:"cc_duration",     label:"Duration",                        type:"multicheck", options:["< 1 week (acute)","1–2 weeks","2–4 weeks (subacute)","1–3 months","3–6 months (chronic)","6–12 months","1–2 years","2–5 years","> 5 years","Since childhood","Since last episode of same injury","Recurring — multiple episodes"] },
      { id:"cc_side",         label:"Laterality",                      type:"multicheck", options:["Unilateral — right dominant","Unilateral — left dominant","Bilateral — symmetric","Bilateral — right worse","Bilateral — left worse","Central","Axial","Diffuse — not specific","Migrates between sides","Alternates"] },
      { id:"cc_notes",        label:"Additional Complaint Notes",      type:"textarea", placeholder:"Any other details about the chief complaint" },
    ]
  },

  pain_analysis: {
    label:"Pain Analysis", icon:"🌡️", color:"#ff8c42",
    fields:[
      { id:"pa_vas_now",    label:"NRS — Current Pain (0–10)",          type:"number", placeholder:"0 = no pain, 10 = worst imaginable" },
      { id:"pa_vas_best",   label:"NRS — Best Pain (0–10)",             type:"number", placeholder:"Pain at its best" },
      { id:"pa_vas_worst",  label:"NRS — Worst Pain (0–10)",            type:"number", placeholder:"Pain at its worst" },
      { id:"pa_vas_avg",    label:"NRS — Average Pain (0–10)",          type:"number", placeholder:"Average over past week" },
      { id:"pa_quality",    label:"Pain Quality (select all that apply)",type:"multicheck", options:["Sharp","Dull","Aching","Burning","Electric shock","Shooting","Stabbing","Throbbing","Cramping","Gnawing","Tight/squeezing","Heavy","Numb","Tingling","Pins and needles","Stinging","Pressure","Deep","Superficial","Constant ache","Intermittent sharp","Referred","Radiating","Spontaneous","Provoked only"] },
      { id:"pa_depth",      label:"Pain Depth",                         type:"multicheck", options:["Superficial — skin/subcutaneous","Fascial layer","Muscular","Joint","Bone","Deep unlocatable","Referred — felt at distance from source","Central sensitisation pattern — widespread"] },
      { id:"pa_onset_speed",label:"Pain Onset Speed",                   type:"multicheck", options:["Immediate (seconds)","Within minutes","Within hours","Delayed (next day)","24–48 hours after activity","Gradual over days","Slow progressive over weeks"] },
      { id:"pa_pattern",    label:"Pain Pattern",                       type:"multicheck", options:["Constant — never goes away","Constant — varies in intensity","Intermittent — comes and goes","Predictable — pattern clear","Unpredictable — random","Only with specific movements","Only with loading / weight-bearing","Only with sustained postures","Only at rest","Night pain waking patient","Morning dominant","End of day dominant","Activity dependent","Weather dependent","Hormonal pattern","Post-activity delayed"] },
      { id:"pa_nature",     label:"Pain Nature / Tissue Source",        type:"multicheck", options:["Nociceptive — local, sharp, movement-related","Neuropathic — burning, shooting, dermatomal","Nociplastic — widespread, unpredictable, sensitisation","Central sensitisation features","Inflammatory — worse at rest, morning stiffness >30 min","Mechanical — worse with loading, better with rest","Discogenic — worse flexion, cough/sneeze","Facet — worse extension, eases with flexion","Neural — shooting, tingling, dermatomal","Vascular — cramping with walking, eases with rest","Visceral — poorly localized, unaffected by movement","Psychosocial overlay"] },
      { id:"pa_intensity_scale",label:"Pain Scale Used",                type:"multicheck", options:["NRS (Numerical Rating Scale 0–10)","VAS (Visual Analog Scale)","FACES pain scale (paediatric/cognitive)","BPI (Brief Pain Inventory)","McGill Pain Questionnaire"] },
      { id:"pa_notes",      label:"Pain Analysis Notes",                type:"textarea", placeholder:"Detailed pain description, any additional features" },
    ]
  },

  symptom_behavior: {
    label:"Symptom Behaviour", icon:"📈", color:"#7f5af0",
    fields:[
      { id:"sb_change",     label:"Symptom Change Over Time",           type:"multicheck", options:["Getting progressively worse","Slowly improving","Stable — no change","Fluctuating — good and bad days","Improving since treatment started","Worsening despite treatment","Episodic — episodes getting more frequent","Episodic — episodes getting less frequent","Plateau — improvement stopped","Post-surgical — expected trajectory","Changed character recently"] },
      { id:"sb_morning",    label:"Morning Behaviour",                   type:"multicheck", options:["Worst on waking — eases quickly (<30 min)","Worse on waking — prolonged stiffness (>30 min)","Worst on waking — stays bad all morning","Stiff on waking — improves with movement","No morning pattern","Better in morning — worse later","Pain starts after getting up","First steps painful (plantar fascia pattern)","Getting out of bed painful","Morning headache"] },
      { id:"sb_daytime",    label:"Daytime Behaviour",                   type:"multicheck", options:["Worsens through the day","Improves through the day","Constant throughout day","Worse after sitting","Worse after standing","Worse after walking","Improves with movement","Worsens with prolonged activity","Better with rest","Worse with rest — restlessness","Worse in afternoon","Specific time of day pattern"] },
      { id:"sb_evening",    label:"Evening Behaviour",                   type:"multicheck", options:["Worst in evening","Improves in evening","Constant all evening","Worse after day's activity","Better after resting in evening","Disrupts evening activities","Prevents social activities","Worse watching TV / sitting","Better with legs elevated","No evening pattern"] },
      { id:"sb_night",      label:"Night Behaviour",                    type:"multicheck", options:["No night pain","Pain disturbs sleep — takes time to settle","Pain wakes from sleep — can return to sleep","Pain wakes repeatedly","Cannot sleep on affected side","Position-dependent night pain","Constant night pain — cannot sleep","Night sweats accompanying pain","Night pain — no position of comfort (red flag)","Arm/leg symptoms at night (neural)","Improved sleep with pain medication"] },
      { id:"sb_irritability",label:"Symptom Irritability",              type:"multicheck", options:["Low irritability — hard to aggravate, quick to settle","Moderate irritability — some aggravation, moderate settling time","High irritability — easily aggravated, slow to settle","Very high irritability — severe and prolonged aggravation","Rest eases quickly (mechanical)","Activity eases (inflammatory)","Unpredictable — no clear pattern","Multiple unrelated triggers"] },
      { id:"sb_notes",      label:"Symptom Behaviour Notes",            type:"textarea", placeholder:"24-hour pattern description, any triggers or patterns" },
    ]
  },

  mechanism: {
    label:"Mechanism of Injury", icon:"⚡", color:"#ffb300",
    fields:[
      { id:"moi_type",      label:"Mechanism Type",                     type:"multicheck", options:["Direct trauma — hit/struck","Indirect trauma — force through limb","Torsion/twisting injury","Hyperflexion","Hyperextension","Hyperabduction","Axial compression","Distraction/traction","Deceleration injury","Acceleration injury","Shear force","Crush injury","Fall — onto outstretched hand","Fall — onto knee","Fall — from height","Whiplash — rear impact","Whiplash — side impact","Head-on collision","Overuse / repetitive strain","Cumulative trauma","Postural overload","Lifting injury — flexed spine","Lifting injury — rotated","Awkward reach","Prolonged sustained posture","Contact sport injury","Non-contact sport injury","Swimming injury","Running injury","Throwing injury","Cycling injury","Occupational injury","Post-surgical","Spontaneous — no mechanism","No clear mechanism identified"] },
      { id:"moi_activity",  label:"Activity at Time of Injury",         type:"text", placeholder:"e.g. Playing football, lifting box, sitting at desk" },
      { id:"moi_position",  label:"Body Position at Injury",            type:"text", placeholder:"e.g. Spine flexed and rotated, arm overhead" },
      { id:"moi_first_symptom",label:"First Symptom After Injury",      type:"multicheck", options:["Immediate pain","Delayed pain (within hours)","Next day pain","Immediate swelling","Delayed swelling","Immediate weakness","Immediate numbness/tingling","Felt pop/crack","Heard audible crack/pop","Immediate locking","Immediate giving way","Dizziness post-impact","Loss of consciousness","No immediate symptoms"] },
      { id:"moi_previous",  label:"Previous Same Injury",               type:"multicheck", options:["First occurrence","Second occurrence","Third or more","Recurring — same mechanism each time","Recurring — different mechanisms","Previous injury — same joint different structure","Old injury — previously managed","Old injury — never treated","Progressive — each episode worse","Progressive — each episode resolves less"] },
      { id:"moi_notes",     label:"Mechanism Notes",                    type:"textarea", placeholder:"Detailed description of how the injury occurred" },
    ]
  },

  aggravating: {
    label:"Aggravating Factors", icon:"🔺", color:"#ff4d6d",
    fields:[
      { id:"agg_posture",   label:"Postures that Aggravate",            type:"multicheck", options:["Sitting","Prolonged sitting > 30 min","Prolonged sitting > 1 hour","Standing","Prolonged standing","Standing on hard floors","Lying supine","Lying on affected side","Lying on unaffected side","Lying prone","Slumped posture","Upright posture paradoxically","Sitting with legs crossed","Driving","Computer work","Looking down (phone use)","Looking up","Head turned left","Head turned right"] },
      { id:"agg_movement",  label:"Movements that Aggravate",           type:"multicheck", options:["Forward bending","Backward bending","Side bending left","Side bending right","Rotation left","Rotation right","Reaching overhead","Reaching across body","Lifting","Carrying","Pushing","Pulling","Twisting","Getting up from sitting","Getting in/out of car","Dressing","Putting on shoes/socks","Hair washing","Looking over shoulder","Coughing / sneezing","Deep breathing","Swallowing"] },
      { id:"agg_activity",  label:"Activities that Aggravate",          type:"multicheck", options:["Walking short distance","Walking long distance","Running","Stairs — up","Stairs — down","Squatting","Kneeling","Swimming","Cycling","Gym — weights","Gym — cardio","Yoga/Pilates","Sport specific","Sexual activity","Housework","Gardening","Childcare activities","Manual work","Computer/keyboard work","Carrying children","Prolonged reading","Screen time"] },
      { id:"agg_other",     label:"Other Aggravating Factors",          type:"multicheck", options:["Cold weather","Hot weather","Damp/humid weather","Barometric pressure changes","Stress","Fatigue","Menstrual cycle","Morning worse — inflammatory","After activity — delayed","Alcohol","Dehydration","Poor sleep","Extended screen time","Specific shoes / footwear","Specific mattress / pillow","Work tasks","Emotional states"] },
      { id:"agg_worst",     label:"Single Worst Aggravating Activity",  type:"text", placeholder:"The one thing that makes it worst" },
      { id:"agg_notes",     label:"Aggravating Factors Notes",          type:"textarea", placeholder:"Any other specific triggers or patterns" },
    ]
  },

  relieving: {
    label:"Relieving Factors", icon:"🔻", color:"#00c97a",
    fields:[
      { id:"rel_posture",   label:"Postures that Relieve",              type:"multicheck", options:["Lying flat","Lying with knees bent","Lying with legs elevated","Lying on affected side","Lying on unaffected side","Sitting upright","Sitting with lumbar support","Sitting with legs elevated","Standing","Walking slowly","Standing with weight shifted","Hands and knees position","Side lying with pillow between knees","Prone lying","Prone lying with pillow under abdomen","Supported sitting (leaning on arms)"] },
      { id:"rel_movement",  label:"Movements that Relieve",             type:"multicheck", options:["Gentle walking","Specific direction movement (McKenzie preference)","Extension relieves","Flexion relieves","Rotation relieves","Side-bend relieves","Traction (self-applied)","Chin tuck","Shoulder blade squeeze","Hip circles / gentle rotation","Stretching","Gentle exercise","Yoga / stretching","Swimming","Aquatic exercise","Specific physiotherapy exercises"] },
      { id:"rel_manual",    label:"Manual / Physical Treatments",       type:"multicheck", options:["Physiotherapy manual therapy","Massage — general","Massage — deep tissue","Osteopathy","Chiropractic","Dry needling / acupuncture","Joint manipulation","Joint mobilisation","Stretching by therapist","Taping / strapping","Bracing / orthotics","Heat application","Ice application","Hot shower / bath","TENS machine","Ultrasound therapy","Shockwave therapy","Hydrotherapy"] },
      { id:"rel_medication",label:"Medications that Help",              type:"multicheck", options:["Paracetamol","Ibuprofen / NSAIDs","Naproxen","Codeine / opioids","Muscle relaxants","Neuropathic medications (Gabapentin/Pregabalin)","Topical NSAIDs (Voltarol)","Topical capsaicin","Cortisone injection","Hyaluronic acid injection","PRP injection","Antidepressants (pain management)","Sleep medication","No medication effective","Not tried medication"] },
      { id:"rel_other",     label:"Other Relieving Factors",            type:"multicheck", options:["Rest","Sleep","Distraction","Reduced stress","Alcohol (temporary)","Warm weather","Positive mood","After work/reduced loading","Weekend better than workdays","Holiday better (supports occupational cause)","After socialising","Mindfulness/meditation","CPAP (if sleep apnoea related)"] },
      { id:"rel_best",      label:"Single Best Relieving Factor",       type:"text", placeholder:"What helps the most" },
      { id:"rel_notes",     label:"Relieving Factors Notes",            type:"textarea", placeholder:"Any other specific factors" },
    ]
  },

  pain_pattern_24hr: {
    label:"24-Hour Pain Pattern", icon:"🕐", color:"#00d4ff",
    fields:[
      { id:"h24_wake",      label:"On Waking (6–8am)",                  type:"multicheck", options:["Pain free on waking","Stiff but not painful","Mild pain — eases quickly","Moderate pain","Severe pain","Takes > 30 min to ease","Takes > 1 hour to ease","Pain free on waking then worsens","Pain wakes before alarm","Dependent on sleep position","Worse if slept badly"] },
      { id:"h24_morning",   label:"Morning (8am–12pm)",                  type:"multicheck", options:["Eases progressively through morning","Improves rapidly with movement","Stays constant through morning","Worsens through morning","Best of the day","Stiffness clears by 10am","Stiffness persists all morning","Requires medication to function in morning","Can work in morning","Cannot work in morning"] },
      { id:"h24_midday",    label:"Midday (12pm–2pm)",                   type:"multicheck", options:["Best time of day","Moderate — manageable","Worsening from morning","Improved from morning","Lunch break movement helps","Sitting at desk worsening","Standing for lunch worsening","Pain after lunch — eating related?","No change at midday"] },
      { id:"h24_afternoon", label:"Afternoon (2pm–6pm)",                 type:"multicheck", options:["Progressive worsening through afternoon","Constant through afternoon","Fatigue driving pain increase","Activity-related worsening","Needs rest break","Most productive time","Pain manageable but present","Requires medication by 4pm","Improving through afternoon","Worst of day"] },
      { id:"h24_evening",   label:"Evening (6pm–10pm)",                  type:"multicheck", options:["Eases with rest in evening","Pain increases in evening","Difficult to relax due to pain","Prevents enjoying evening activities","Better once off feet","Worse watching TV / sitting","Better with evening walk","Medication needed for evening","Unable to sit comfortably","Cannot perform evening tasks"] },
      { id:"h24_night",     label:"Night (10pm–6am)",                    type:"multicheck", options:["Sleeps through — no night pain","Takes > 30 min to get comfortable","Pain on turning in bed","Wakes once per night","Wakes multiple times","Cannot sleep >4 hours continuously","Night pain worse than day pain","Position change relieves temporarily","Requires medication to sleep","Not related to sleep position","Restless legs","Better second half of night","Worsens toward morning"] },
      { id:"h24_pattern_summary",label:"Overall 24hr Pattern Type",     type:"multicheck", options:["Inflammatory pattern — worse at rest, morning stiffness >30 min","Mechanical pattern — worse with loading, better with rest","Neuropathic — constant burning, worse at night","Postural — worse sustained postures, relieved by position change","Activity-dependent — directly proportional to load","Deconditioned — poor exercise tolerance driving pattern","Visceral — unrelated to posture or movement","Psychosocial — disproportionate to physical findings","Hormonal cycle related","No clear pattern"] },
      { id:"h24_notes",     label:"24-Hour Pattern Notes",              type:"textarea", placeholder:"Describe the typical day in detail" },
    ]
  },

  functional_limitations: {
    label:"Functional Limitations", icon:"🚫", color:"#ff8c42",
    fields:[
      { id:"fl_self_care",  label:"Self-Care Activities",               type:"multicheck", options:["Washing/showering — normal","Showering — needs modified technique","Bathing — cannot use bath","Washing hair — difficulty","Dressing — independent","Dressing — upper body difficulty","Dressing — lower body difficulty","Putting on shoes/socks — difficulty","Grooming / shaving — difficulty","Toileting — normal","Toileting — reduced mobility","Feeding self — normal","Feeding — difficulty with cutlery","Cannot perform self-care independently"] },
      { id:"fl_mobility",   label:"Mobility",                           type:"multicheck", options:["Walks normally","Walks with antalgia","Uses walking stick","Uses crutches","Uses walking frame","Wheelchair user — full time","Wheelchair user — part time","Limps — antalgic","Limps — neurological","Stairs — normal","Stairs — one step at a time","Stairs — requires rail","Stairs — cannot manage","Ramp preferred over stairs","Cannot walk > 100m","Cannot walk > 500m","Walking limited — less than 1km","Walking limited — 1–5km","No walking limitation"] },
      { id:"fl_domestic",   label:"Domestic Activities",                type:"multicheck", options:["Cooking — normal","Cooking — standing tolerance limited","Cooking — cannot lift pots","Cleaning — normal","Cleaning — cannot vacuum","Cleaning — cannot mop","Ironing — cannot perform","Laundry — normal","Laundry — cannot lift basket","Bed making — difficulty","Shopping — normal","Shopping — cannot carry bags","Shopping — requires trolley support","Shopping — cannot walk full shop","Childcare — normal","Childcare — lifting children limited","Gardening — limited","DIY / home repairs — limited"] },
      { id:"fl_work",       label:"Work Capacity",                      type:"multicheck", options:["Full time work — no restriction","Reduced hours due to pain","Modified duties required","Working from home adaptations","Cannot sit > 30 min","Cannot sit > 1 hour","Cannot stand > 30 min","Cannot stand > 1 hour","Computer work painful","Manual tasks restricted","Lifting restricted","Cannot drive","Driving restricted to short distances","Off work — short term","Off work — long term","At risk of job loss","Reduced income impact"] },
      { id:"fl_social",     label:"Social Participation",              type:"multicheck", options:["Full social life maintained","Reduced socialising due to pain","Cannot sit for restaurant/cinema","Cannot travel long distances","Cannot travel by plane","Avoids social situations due to pain","Sex/intimacy affected","Relationship strain","Cannot play with children/grandchildren","Cannot attend religious activities","Cannot volunteer","Social isolation increasing","Dependent on others for transport","Reduced due to embarrassment"] },
      { id:"fl_sport_rec",  label:"Sport / Recreation",                 type:"multicheck", options:["No sport/recreation restriction","Reduced intensity","Playing through pain","Performance significantly reduced","Cannot play primary sport","Cannot exercise at all","Cannot run","Cannot swim","Cannot cycle","Cannot lift weights","Gym attendance reduced","Yoga/Pilates restricted","Dancing restricted","Walking/hiking restricted","Cannot participate in team sport","Retired from sport due to pain"] },
      { id:"fl_notes",      label:"Functional Limitation Notes",        type:"textarea", placeholder:"Describe the most impactful functional limitations in detail" },
    ]
  },

  activity_restrictions: {
    label:"Activity Participation Restrictions", icon:"🏃", color:"#a8ff3e",
    fields:[
      { id:"ar_sport_level",label:"Sport / Exercise Level",             type:"multicheck", options:["Sedentary — no regular exercise","Light activity — walking only","Moderate — 2–3x/week exercise","Active — 4–5x/week","Very active — daily training","Elite competitive athlete","Masters athlete (35+)","Youth/junior athlete","Recreational sport only","Club sport competition","National level competition","Professional/paid athlete","Post-competition rehabilitation","Pre-season rehabilitation","In-season management","Return to sport goal"] },
      { id:"ar_sports_played",label:"Sports / Activities Played",       type:"multicheck", options:["Football / Soccer","Rugby","Cricket","Tennis","Badminton","Squash","Golf","Athletics — track","Athletics — field","Swimming","Cycling","Triathlon","Running — road","Running — trail","CrossFit / HIIT","Weightlifting / powerlifting","Yoga / Pilates","Martial arts","Boxing","Dance","Rock climbing","Skiing / snowboarding","Rowing / paddling","Horse riding","Basketball","Volleyball","Netball","Hockey","Gymnastics","Cheerleading","Other (specify in notes)"] },
      { id:"ar_restrictions", label:"Activity Restrictions",            type:"multicheck", options:["Cannot return to sport","Restricted from contact sport","Restricted from impact activities","Restricted from overhead sport","Restricted from rotational sport","Restricted from running","Restricted from jumping","Restricted from lifting","Restricted from water sport","Restricted from racquet sport","Doctor has advised rest","Player/coach advised modified training","Self-limiting due to pain","Fearful of re-injury","Insurance/medico-legal restriction","Pre-clearance assessment required","Return to sport protocol underway"] },
      { id:"ar_goal_sport",  label:"Activity Goal",                     type:"text", placeholder:"e.g. Return to playing football at weekend level" },
      { id:"ar_timeline",    label:"Desired Return Timeline",           type:"multicheck", options:["ASAP — as fast as possible","< 2 weeks","2–4 weeks","4–8 weeks","2–3 months","3–6 months","6–12 months","No specific timeline","Before specific event (specify in notes)","Competition date (specify in notes)","End of season","Next season"] },
      { id:"ar_notes",       label:"Activity Restriction Notes",        type:"textarea", placeholder:"Details of sport, activity level, and return-to-sport goals" },
    ]
  },

  occupational: {
    label:"Occupational History", icon:"💼", color:"#ffd700",
    fields:[
      { id:"occ_job_title",  label:"Current Job Title",                 type:"text", placeholder:"e.g. Nurse, Software developer, Teacher" },
      { id:"occ_employer",   label:"Employer / Workplace",              type:"text", placeholder:"Name and type of workplace" },
      { id:"occ_duration",   label:"Time in Current Role",              type:"text", placeholder:"e.g. 3 years, 6 months" },
      { id:"occ_hours",      label:"Working Hours",                     type:"multicheck", options:["Part time < 20 hrs/week","Part time 20–30 hrs/week","Full time 35–40 hrs/week","Extended hours > 40 hrs/week","Night shifts","Rotating shifts","Weekend work","On-call duties","Variable / unpredictable hours","Working from home","Hybrid working","Office based","Field / site based","Remote / travelling"] },
      { id:"occ_tasks",      label:"Primary Physical Demands",          type:"multicheck", options:["Sedentary — primarily seated","Standing — prolonged","Walking — moderate","Walking — extensive","Repetitive lifting","Heavy lifting > 20kg","Overhead work","Forward bending repetitive","Driving — < 2 hrs/day","Driving — 2–4 hrs/day","Driving — > 4 hrs/day","Vibration exposure (hand/arm)","Whole body vibration","Repetitive fine motor tasks","Computer/keyboard intensive","Visual display unit (VDU)","Manual handling","Climbing ladders/scaffolding","Awkward postures","Cold environment","Hot environment","High noise environment","Shift work","Call centre/telephone","Patient handling (healthcare)"] },
      { id:"occ_ergonomics", label:"Workstation / Ergonomic Factors",  type:"multicheck", options:["Chair height adjustable","Lumbar support provided","Monitor at eye level","Dual monitors","Standing desk available","Standing desk not available","Keyboard position optimal","Mouse — standard","Mouse — ergonomic","Laptop only — no docking","Headset for phone calls","Poor lighting","Screen glare","Working in cramped space","Hot-desking (variable workstation)","No ergonomic assessment done","Ergonomic assessment done","Ergonomic aids provided","Occupational health involved"] },
      { id:"occ_work_impact",label:"Impact of Symptoms on Work",        type:"multicheck", options:["No impact — working fully","Reduced productivity","Reduced hours","Modified duties agreed","Off work short term (< 4 weeks)","Off work medium term (4–12 weeks)","Off work long term (> 12 weeks)","Risk of job loss","Employer unsupportive","Employer very supportive","Occupational health referral made","Phased return to work planned","Redeployment considered","Unable to return to same role","Changed career due to injury","Work compensation claim active","Work injury — employer dispute"] },
      { id:"occ_history",    label:"Previous Occupational History",     type:"textarea", placeholder:"Previous jobs, cumulative exposures, injuries at work" },
      { id:"occ_notes",      label:"Occupational Notes",                type:"textarea", placeholder:"Any other relevant occupational information" },
    ]
  },

  sports_history: {
    label:"Sports / Activity History", icon:"🏅", color:"#ff9a9e",
    fields:[
      { id:"sh_current_sport",label:"Current Sports / Activities",      type:"text", placeholder:"List all current sports and activities" },
      { id:"sh_years",        label:"Years in Sport",                   type:"text", placeholder:"e.g. 15 years football, 3 years gym" },
      { id:"sh_training_load",label:"Current Training Load",            type:"multicheck", options:["No training currently","1 session/week","2 sessions/week","3 sessions/week","4 sessions/week","5–6 sessions/week","Daily training","Twice daily training","Reduced from normal (injury)","Pre-season (high load)","In-season (moderate-high)","Off-season (reduced)","Competition phase","Taper phase","Just returned after break"] },
      { id:"sh_recent_change",label:"Recent Load Changes",              type:"multicheck", options:["No recent change","Increased volume recently","Increased intensity recently","New sport / activity started","Changed training surface","Changed footwear","Changed technique","Returned from injury lay-off","Just started training again","Pre-season ramp up","Overtraining suspected","No warm-up / cool-down","Training programme changed","New coach / trainer"] },
      { id:"sh_past_injuries",label:"Past Sports Injuries",             type:"multicheck", options:["Ankle sprain (L)","Ankle sprain (R)","Knee ligament (ACL/MCL/PCL/LCL)","Meniscal injury","Shin splints","Stress fracture","Hamstring strain","Quadriceps strain","Calf strain","Achilles tendinopathy","Plantar fasciitis","Patellofemoral pain","IT band syndrome","Hip flexor strain","Groin strain","Hip labral tear","Lower back — disc","Lower back — facet","SI joint","Rotator cuff","Shoulder dislocation","AC joint","Biceps tendon","Tennis/golfer elbow","Wrist sprain","Fractures — upper limb","Fractures — lower limb","Concussion","Stress fracture — foot","No significant past injuries"] },
      { id:"sh_previous_physio",label:"Previous Physiotherapy",        type:"multicheck", options:["No previous physiotherapy","Physiotherapy — helpful","Physiotherapy — partially helpful","Physiotherapy — not helpful","Physiotherapy — made worse","Previous surgery + physio","Ongoing physiotherapy elsewhere","Discharged from physiotherapy","Did not complete course","Sports medicine physician input","Podiatry input","Orthotics prescribed","Strength and conditioning input"] },
      { id:"sh_performance",  label:"Performance Impact",              type:"multicheck", options:["No performance impact","Slightly reduced performance","Significantly reduced performance","Training pain free, competition painful","Cannot train at full capacity","Cannot compete currently","Changed position/event due to injury","Dropped training group / level","Playing through pain","Avoiding certain skills/movements","Biomechanical adaptations noted","Coach has noted change in performance"] },
      { id:"sh_notes",        label:"Sports History Notes",            type:"textarea", placeholder:"Training history, injury history, performance goals" },
    ]
  },

  sleep: {
    label:"Sleep Analysis", icon:"😴", color:"#b388ff",
    fields:[
      { id:"sl_hours",      label:"Average Sleep Duration",             type:"multicheck", options:["< 4 hours (severely inadequate)","4–5 hours (inadequate)","5–6 hours (below optimal)","6–7 hours (borderline)","7–8 hours (optimal)","8–9 hours (slightly long)","9–10 hours (prolonged)","10+ hours (excessive — fatigue/depression?)","Variable — no consistent pattern","Sleep disrupted by work shifts"] },
      { id:"sl_quality",    label:"Sleep Quality",                      type:"multicheck", options:["Excellent — restorative","Good — mostly refreshed","Fair — sometimes refreshed","Poor — rarely refreshed","Very poor — never refreshed","Difficulty falling asleep","Difficulty staying asleep","Early morning waking","Vivid dreams / nightmares","Restless sleep","Teeth grinding (bruxism)","Snoring reported","Sleep apnoea diagnosed","Sleep apnoea suspected — not diagnosed","CPAP user","Partner reports abnormal breathing","Restless legs syndrome","Periodic limb movement disorder"] },
      { id:"sl_position",   label:"Sleep Position",                     type:"multicheck", options:["Back sleeper — no pillow","Back sleeper — one pillow","Back sleeper — multiple pillows","Side sleeper — left dominant","Side sleeper — right dominant","Side sleeper — switches sides","Front/prone sleeper","Recliner / armchair sleeper","Cannot lie flat — reflux","Pillow between knees","Pillow under knees","Wedge pillow user","Cervical pillow","Standard pillow","Memory foam pillow","Multiple pillows under head"] },
      { id:"sl_mattress",   label:"Mattress / Sleep Surface",           type:"multicheck", options:["Standard spring mattress","Memory foam mattress","Orthopaedic mattress","Old / sagging mattress","New mattress (< 6 months)","Firm preferred","Soft preferred","Hospital bed at home","Sofa sleeping","Floor sleeping","Adjustable bed","Partner in bed","Children in bed","Pets in bed"] },
      { id:"sl_impact",     label:"Pain Impact on Sleep",               type:"multicheck", options:["Pain does not affect sleep","Pain slightly affects sleep quality","Pain moderately disrupts sleep","Pain severely disrupts sleep","Pain prevents falling asleep","Pain wakes from sleep — once","Pain wakes from sleep — multiple times","Pain on turning in bed","Pain on getting up to toilet","Morning pain from sleep position","No position of comfort","Pain free during sleep — worsens on waking","Fear of sleep due to pain"] },
      { id:"sl_hygiene",    label:"Sleep Hygiene",                      type:"multicheck", options:["Regular sleep schedule","Irregular sleep times","Screen use before bed","Late caffeine use (after 2pm)","Alcohol affecting sleep","Regular exercise (positive effect)","No exercise","Bedroom too hot","Bedroom too cold","Bedroom — noise disruption","Napping during day","Stress affecting sleep","Anxiety at bedtime","Pre-sleep routine established","No pre-sleep routine"] },
      { id:"sl_notes",      label:"Sleep Analysis Notes",              type:"textarea", placeholder:"Any other sleep information relevant to presentation" },
    ]
  },

  psychosocial: {
    label:"Stress / Emotional Factors", icon:"🧠", color:"#90caf9",
    fields:[
      { id:"ps_stress",     label:"Current Stress Level",               type:"multicheck", options:["No significant stress","Mild stress — manageable","Moderate stress — affecting function","High stress — significantly impacting life","Severe stress — crisis level","Work stress dominant","Financial stress dominant","Relationship stress dominant","Bereavement / loss","Family illness / carer stress","Divorce / separation","Housing stress","Legal proceedings stress","Compensation claim stress","Academic stress","Major life change","Multiple simultaneous stressors"] },
      { id:"ps_mood",       label:"Mood / Emotional State",             type:"multicheck", options:["Mood normal / positive","Mild low mood","Moderate depression — diagnosed","Severe depression — diagnosed","Anxiety — mild","Anxiety — moderate / diagnosed","Anxiety — severe / panic attacks","PTSD — diagnosed","PTSD — suspected","Post-natal depression","Grief / bereavement","Anger / frustration prominent","Fear of movement (kinesiophobia)","Catastrophising (believes worst outcome)","Pain catastrophising scale elevated","Hopelessness about recovery","Anger at cause of injury (third party)","Feeling dismissed / not believed","Previously dismissed by healthcare"] },
      { id:"ps_fear_avoid", label:"Fear Avoidance Beliefs",             type:"multicheck", options:["No fear avoidance","Mild — avoids some activities","Moderate — significant avoidance","Severe — very restricted activities","Afraid movement will cause damage","Believes rest is the only treatment","Afraid of re-injury","Avoids all exercise","Protective of injured area excessively","Tampa Scale of Kinesiophobia elevated","Believes pain = damage (unhelpful belief)","Functional overlay suspected","Nocebo effect from previous advice","Fearful of specific diagnoses","Scared of surgery","Catastrophic thinking about future"] },
      { id:"ps_social",     label:"Social Support",                     type:"multicheck", options:["Strong social support network","Partner/spouse supportive","Partner/spouse unsupportive","Family supportive","Family unsupportive","Lives alone","Socially isolated","Good friend network","No close friends","Religious/community support","Carer role limiting own recovery","Dependent on others — increased stress","Children at home — demanding","Good workplace support","Poor workplace support","Employer hostile to injury","Online support groups"] },
      { id:"ps_cope",       label:"Coping Strategies Used",             type:"multicheck", options:["Exercise / physical activity","Mindfulness / meditation","Psychological therapy (CBT/ACT)","Medication","Alcohol (maladaptive)","Cannabis / substances","Social support — friends/family","Religious / spiritual practices","Journalling","Distraction (TV, hobbies)","Rest and pacing","Positive self-talk","Problem-solving approach","Avoidance and withdrawal","Denial","Catastrophising (maladaptive)","No coping strategies identified","Open to psychological input"] },
      { id:"ps_yellow_flags",label:"Yellow Flag Screening",             type:"multicheck", options:["Belief pain is harmful / damaging","Fear of activity / movement","Catastrophising","Low mood / depression","Work dissatisfaction / conflict","Compensation / litigation active","Poor social support","Passive coping — waiting to be fixed","Prior chronic pain episode","Maladaptive pain beliefs","Somatisation of stress","Hypervigilance to symptoms","Poor sleep contributing to pain","Unhelpful advice from previous clinician","Multiple failed treatments (suggests psychosocial driver)","Poor self-efficacy for recovery"] },
      { id:"ps_notes",      label:"Psychosocial Notes",                 type:"textarea", placeholder:"Psychosocial assessment — attitude, beliefs, emotional factors" },
    ]
  },

  past_medical: {
    label:"Past Medical History", icon:"📋", color:"#ff6b6b",
    fields:[
      { id:"pmh_conditions", label:"Medical Conditions",                type:"multicheck", options:["Type 1 Diabetes","Type 2 Diabetes","Hypertension","Cardiac disease — IHD","Cardiac disease — heart failure","Cardiac disease — arrhythmia","Previous MI (heart attack)","Previous stroke / TIA","Peripheral vascular disease","DVT / pulmonary embolism","Asthma","COPD","Chronic kidney disease","Liver disease","Autoimmune — Rheumatoid Arthritis","Autoimmune — Lupus (SLE)","Autoimmune — Ankylosing Spondylitis","Autoimmune — Psoriatic Arthritis","Osteoarthritis","Osteoporosis / Osteopenia","Gout","Fibromyalgia","Chronic Fatigue Syndrome (ME/CFS)","IBS / IBD","GORD / acid reflux","Epilepsy","Multiple Sclerosis","Parkinson's Disease","Peripheral neuropathy","Hypothyroidism","Hyperthyroidism","Obesity","Malignancy — current or past","HIV","Hepatitis B / C","Mental health condition (see psychosocial)","Haemophilia / bleeding disorder","Anaemia","Eating disorder — history","Chronic pain condition — previous"] },
      { id:"pmh_pregnancy",  label:"Pregnancy / Gynaecological",        type:"multicheck", options:["Not applicable","Currently pregnant","Post-partum < 6 months","Post-partum 6–12 months","Multiple pregnancies","C-section history","Pelvic floor dysfunction","Diastasis recti","Menopause — peri","Menopause — post","Endometriosis","PCOS","Hormonal therapy (HRT)","Oral contraceptive pill"] },
      { id:"pmh_fractures",  label:"Fractures / Trauma History",        type:"multicheck", options:["No significant fractures","Cervical spine fracture","Thoracic spine fracture","Lumbar spine fracture","Coccyx fracture","Pelvic fracture","Hip fracture","Femur fracture","Tibial/fibular fracture","Foot fractures","Shoulder / clavicle fracture","Humerus fracture","Radius/ulna fracture","Wrist fracture","Hand/finger fractures","Rib fractures","Sternal fracture","Multiple fractures — trauma","Stress fractures — history","Growth plate injury (paediatric)"] },
      { id:"pmh_neuro",      label:"Neurological History",              type:"multicheck", options:["No neurological history","Disc herniation — cervical","Disc herniation — lumbar","Spinal stenosis — cervical","Spinal stenosis — lumbar","Spondylolisthesis","Spondylolysis","Cauda equina — history","Myelopathy — cervical","Radiculopathy — previous episode","Carpal tunnel syndrome — history","Cubital tunnel syndrome","Ulnar nerve neuropathy","Common peroneal nerve injury","Sciatic nerve injury","Brachial plexus injury","Thoracic outlet syndrome","Meralgia paraesthetica"] },
      { id:"pmh_other",      label:"Other Relevant History",            type:"textarea", placeholder:"Any other relevant past medical conditions, hospitalisations" },
    ]
  },

  surgical: {
    label:"Surgical History", icon:"🏥", color:"#ff8c42",
    fields:[
      { id:"surg_spine",    label:"Spinal Surgery",                     type:"multicheck", options:["No spinal surgery","Cervical discectomy","Cervical fusion (ACDF)","Lumbar microdiscectomy","Lumbar laminectomy","Lumbar decompression","Lumbar fusion (TLIF/PLIF/ALIF)","Lumbar fusion — multiple levels","Scoliosis correction — spinal rods","Disc replacement — cervical","Disc replacement — lumbar","Coccygectomy","Spinal cord stimulator implant"] },
      { id:"surg_lower",    label:"Lower Limb Surgery",                 type:"multicheck", options:["No lower limb surgery","Hip replacement (THR) — left","Hip replacement (THR) — right","Hip resurfacing","Hip arthroscopy — FAI surgery","Hip arthroscopy — labral repair","Knee replacement (TKR) — left","Knee replacement (TKR) — right","ACL reconstruction — left","ACL reconstruction — right","PCL reconstruction","Meniscectomy — partial","Meniscal repair","Knee arthroscopy","Patellofemoral realignment","OATS / cartilage repair (knee)","Ankle ligament reconstruction","Ankle arthroscopy","Ankle fusion","Achilles repair","Plantar fascia surgery","Foot surgery — bunion (hallux valgus)","Foot surgery — other","Tibial osteotomy"] },
      { id:"surg_upper",    label:"Upper Limb Surgery",                 type:"multicheck", options:["No upper limb surgery","Shoulder replacement (TSR)","Shoulder arthroscopy — subacromial","Shoulder arthroscopy — SLAP repair","Shoulder arthroscopy — Bankart","Rotator cuff repair — partial","Rotator cuff repair — full thickness","AC joint surgery","Clavicle ORIF","Shoulder fusion","Elbow arthroscopy","Elbow replacement","Tennis elbow surgery","Ulnar nerve transposition","Carpal tunnel release — left","Carpal tunnel release — right","Dupuytren's contracture release","De Quervain's surgery","Wrist arthroscopy","Wrist fusion","TFCC repair","Hand surgery","Trigger finger release"] },
      { id:"surg_abdominal",label:"Abdominal / Pelvic Surgery",        type:"multicheck", options:["No abdominal surgery","Appendectomy","Caesarean section","Hysterectomy","Laparoscopic surgery (general)","Bowel surgery","Colostomy","Hernia repair — inguinal","Hernia repair — umbilical","Hernia repair — hiatus","Prostatectomy","Bladder surgery","Kidney surgery","Gallbladder removal (cholecystectomy)","Liver surgery","Splenectomy","Bariatric surgery"] },
      { id:"surg_other",    label:"Other Surgery",                      type:"multicheck", options:["No other surgery","General anaesthetic — other","Cardiac surgery","Thoracic surgery","Neurosurgery — brain","ENT surgery","Eye surgery","Dental surgery — major","Skin graft","Amputation","Trauma surgery — ORIF","Tumour excision"] },
      { id:"surg_complications",label:"Surgical Complications",        type:"multicheck", options:["No complications","Wound infection","DVT post-surgery","Pulmonary embolism post-surgery","Nerve damage intra-operative","Implant failure","Hardware removal required","Revision surgery required","Prolonged rehabilitation","Pain persisting post-surgery","Unexpected outcome","Re-admission post-surgery"] },
      { id:"surg_notes",    label:"Surgical History Notes",            type:"textarea", placeholder:"Dates, outcomes, complications, ongoing effects of surgery" },
    ]
  },

  medications: {
    label:"Medication History", icon:"💊", color:"#80deea",
    fields:[
      { id:"med_analgesia",  label:"Current Analgesia",                 type:"multicheck", options:["No analgesia currently","Paracetamol — PRN","Paracetamol — regular","Ibuprofen — PRN","Ibuprofen — regular","Naproxen","Diclofenac (oral)","Diclofenac (topical — Voltarol)","Celecoxib (COX-2 inhibitor)","Codeine","Co-codamol (paracetamol + codeine)","Tramadol","Morphine (oral)","Oxycodone","Gabapentin","Pregabalin (Lyrica)","Amitriptyline (pain)","Duloxetine","Capsaicin topical","Lidocaine patches","Aspirin (analgesia)","Compound analgesics"] },
      { id:"med_injections", label:"Recent / Past Injections",          type:"multicheck", options:["No injections","Corticosteroid injection < 3 months","Corticosteroid injection 3–12 months","Multiple steroid injections — same site","Hyaluronic acid (viscosupplementation)","PRP (platelet-rich plasma)","Prolotherapy","Trigger point injection","Epidural steroid injection","Selective nerve root block","Facet joint injection","SIJ injection","Botox injection (muscle)","Radiofrequency ablation","Medial branch block"] },
      { id:"med_regular",    label:"Regular Medications (non-pain)",    type:"multicheck", options:["Antihypertensives","Beta blockers","ACE inhibitors","Statins (cholesterol)","Anticoagulants — warfarin","Anticoagulants — DOAC (rivaroxaban/apixaban)","Antiplatelet — aspirin","Antiplatelet — clopidogrel","Antidiabetics — oral","Insulin","Thyroid medication","SSRIs / antidepressants","SNRIs","Benzodiazepines","Sleeping tablets","Immunosuppressants","DMARDs (methotrexate/sulfasalazine)","Biologics (adalimumab/etanercept)","Oral corticosteroids","Hormone therapy (HRT)","Oral contraceptive pill","Bisphosphonates (osteoporosis)","Proton pump inhibitors (PPI)","Inhalers — SABA / LABA / ICS","Anticonvulsants"] },
      { id:"med_allergies",  label:"Drug Allergies / Intolerances",    type:"multicheck", options:["No known drug allergies","Penicillin allergy","NSAIDs — GI intolerance","NSAIDs — allergy/anaphylaxis","Aspirin intolerance","Codeine — side effects","Tramadol — intolerance","Morphine — intolerance","Latex allergy (relevant for treatment)","Iodine allergy","Nickel allergy (relevant for TENS/treatment)","Other — see notes"] },
      { id:"med_supplements",label:"Supplements / Herbal / OTC",       type:"multicheck", options:["No supplements","Vitamin D","Calcium","Magnesium","Fish oil / Omega 3","Glucosamine","Chondroitin","Turmeric / curcumin","CBD oil","Protein supplements","Multivitamin","Iron","Vitamin B12","Folic acid","Melatonin (sleep)","Herbal remedies (specify in notes)","Cannabis — medicinal","Cannabis — recreational"] },
      { id:"med_effectiveness",label:"Medication Effectiveness",       type:"multicheck", options:["Medication well controlled","Medication partially helps","Medication not effective","Side effects limiting use","Too sedating to function","Constipation from opioids","GI side effects from NSAIDs","Stopped medication — side effects","Wants to reduce medication","Currently weaning","No medication for this condition"] },
      { id:"med_notes",      label:"Medication Notes",                 type:"textarea", placeholder:"Any other relevant medication information, recent changes" },
    ]
  },

  red_flags: {
    label:"Red Flag Screening", icon:"🚨", color:"#ff4d6d",
    fields:[
      { id:"rf_malignancy",  label:"Malignancy Red Flags",              type:"multicheck", options:["No malignancy red flags","History of cancer — specify in notes","Unexplained weight loss > 5kg","Night sweats — unexplained","Fever accompanying pain","Fatigue — severe and unexplained","Pain unrelated to movement or position","Pain progressive despite rest","Age > 50 — first episode back pain","Bilateral sciatic symptoms","Pain not responding to any treatment","Supraclavicular lymphadenopathy","Axillary lymphadenopathy","Palpable mass in region of pain"] },
      { id:"rf_cauda",       label:"Cauda Equina Red Flags",            type:"multicheck", options:["No cauda equina flags","Bladder retention — acute","Bladder incontinence — new","Bowel incontinence — new","Saddle anaesthesia — perianal","Saddle anaesthesia — inner thigh","Sexual dysfunction — new onset","Bilateral leg weakness — sudden","Bilateral leg numbness — sudden","Bilateral sciatica","Rapid neurological deterioration","Progressive lower limb weakness"] },
      { id:"rf_vascular",    label:"Vascular Red Flags",                type:"multicheck", options:["No vascular red flags","Calf pain with walking — claudication","Claudication distance < 200m","Rest pain in leg — not musculoskeletal","Absent peripheral pulses (known)","Severe leg pallor","Non-healing leg ulcer","Aortic aneurysm — known","Pulsatile abdominal mass","Severe sudden-onset headache (thunderclap)","Posterior neck pain with visual changes","Dizziness with neck movement (VBI)"] },
      { id:"rf_inflammatory",label:"Inflammatory / Systemic Red Flags", type:"multicheck", options:["No inflammatory red flags","Morning stiffness > 45 minutes","Age of onset < 40 years","Peripheral joint swelling","Iritis / eye inflammation","Psoriasis","Inflammatory bowel disease","Family history of inflammatory arthritis","Enthesitis (tendon insertion pain)","Pain responds to NSAIDs strongly","Fever with musculoskeletal pain","Recent infection preceding pain","Raised inflammatory markers (known)","Immunosuppressed patient"] },
      { id:"rf_fracture",    label:"Fracture / Bone Red Flags",         type:"multicheck", options:["No fracture red flags","Major trauma (RTA, fall from height)","Minor trauma in osteoporotic patient","Age > 70 — first episode back pain","Long-term steroid use","Known osteoporosis","Point tenderness on bone","Localised night pain on bone","Unexplained pathological fracture","Recent corticosteroid use > 3 months"] },
      { id:"rf_neuro",       label:"Neurological Red Flags",            type:"multicheck", options:["No neurological red flags","Myelopathy signs (bilateral weakness/numbness)","Positive Babinski sign","Hyperreflexia — UMN pattern","Rapidly progressive neurological deficit","Cervical myelopathy symptoms","Bilateral hand weakness","Difficulty walking — ataxia","Falls — unexplained","Dysphagia (swallowing difficulty)","Dysarthria (speech difficulty)","Diplopia (double vision)","Facial numbness / weakness","Sudden severe headache","Altered consciousness"] },
      { id:"rf_other",       label:"Other Red Flags",                   type:"multicheck", options:["IV drug use — risk of discitis","Tuberculosis — risk of Pott's disease","Recent infection — septic arthritis risk","Open wound near joint","Acute severe joint swelling — hot","Immunocompromised — any cause","Transplant recipient","Chronic corticosteroid use","Unexplained systemic symptoms","Patient appears systemically unwell","Clinician clinical gut feeling — refer"] },
      { id:"rf_action",      label:"Red Flag Action Taken",             type:"multicheck", options:["No red flags — proceed with assessment","Red flags noted — monitor","Urgent GP referral made","Emergency A&E referral","Same day orthopaedic referral","Urgent MRI requested","Urgent bloods requested","Liaised with GP","Patient informed","Red flags discussed with patient","Safety netting advice given"] },
      { id:"rf_notes",       label:"Red Flag Notes",                   type:"textarea", placeholder:"Document all red flags and actions taken" },
    ]
  },

  yellow_flags: {
    label:"Yellow Flag Screening", icon:"🟡", color:"#ffb300",
    fields:[
      { id:"yf_beliefs",    label:"Beliefs About Pain",                 type:"multicheck", options:["Believes pain = damage (unhelpful)","Believes rest is the only treatment","Believes cannot recover","Believes activity will cause harm","Believes pain is permanent","Expects worst outcome","Catastrophising — magnification","Catastrophising — rumination","Catastrophising — helplessness","Expects surgery is needed","Believes medication is the only solution","Negative health beliefs generally","Multiple previous diagnoses — confused","Conflicting advice received","Received unhelpful nocebo advice"] },
      { id:"yf_emotions",   label:"Emotional Factors",                  type:"multicheck", options:["No significant emotional factors","Mild anxiety","Moderate anxiety","Severe anxiety","Mild depression","Moderate depression","Severe depression","Anger — at cause of injury","Anger — at healthcare system","Fear of the future","Grief from loss of activity/identity","Emotional distress prominent","PTSD symptoms","Emotional overlay affecting presentation","Crying during consultation","Hypervigilance to symptoms"] },
      { id:"yf_behaviour",  label:"Pain Behaviour",                     type:"multicheck", options:["Appropriate pain behaviour","Exaggerated pain behaviour (not malingering)","Reduced pain behaviour (stoic)","Significant kinesiophobia","Avoidance of all activity","Avoidance of specific activities","Withdrawal from social activities","Overprotection of body part","Excessive checking of symptoms","Seeking excessive investigations","Multiple healthcare providers (shopping)","Distress out of proportion to findings","Significant effort intolerance","Deactivated lifestyle","Significant guarding"] },
      { id:"yf_work",       label:"Workplace Yellow Flags",             type:"multicheck", options:["No workplace yellow flags","Unhappy at work pre-injury","Conflict with employer","Conflict with colleagues","Fear of returning to same job","Believes work is harmful","Compensation claim active","Litigation ongoing","Secondary gain possible","Employer dispute","Lack of job control","Monotonous work","Poor workplace relationships","History of workplace bullying","Job insecurity"] },
      { id:"yf_recovery",   label:"Recovery Expectations",              type:"multicheck", options:["Positive — expects recovery","Uncertain about recovery","Negative — does not expect recovery","Unsure what recovery looks like","Expects to return to full function","Expects permanent restriction","Goal — return to sport","Goal — return to work","Goal — pain reduction only","Goal — not clearly identified","Fear of being a burden","Motivated to participate in treatment","Passive recovery expectation","Has not thought about goals"] },
      { id:"yf_assessment", label:"Psychosocial Assessment Tools",      type:"multicheck", options:["Start Back Screening Tool — low risk","Start Back Screening Tool — medium risk","Start Back Screening Tool — high risk","Örebro Musculoskeletal Pain Questionnaire","Tampa Scale Kinesiophobia","Pain Catastrophising Scale","Hospital Anxiety Depression Scale (HADS)","PHQ-9 Depression Screen","GAD-7 Anxiety Screen","Keele STarT Back Tool","Psychosocial referral made","Psychology onward referral","Pain management programme referral"] },
      { id:"yf_notes",      label:"Yellow Flag Notes",                 type:"textarea", placeholder:"Document psychosocial yellow flags and planned management" },
    ]
  },

  patient_goals: {
    label:"Patient Goals", icon:"🎯", color:"#00c97a",
    fields:[
      { id:"pg_primary",    label:"Primary Patient Goal",               type:"textarea", placeholder:"In the patient's own words — what is the number 1 thing they want to achieve?" },
      { id:"pg_goals",      label:"Specific Goals (select all relevant)",type:"multicheck", options:["Return to full-time work","Return to modified work","Return to specific sport","Return to exercise / gym","Return to running","Return to swimming","Return to cycling","Return to golf","Return to team sport","Return to martial arts","Return to dancing","Return to yoga/Pilates","Walk without pain","Walk further distances","Sleep through the night","Reduce pain medication","Stop pain medication","Independent self-care","Lift/carry children","Drive without pain","Travel without pain","Resume social activities","Resume hobbies","Resume sexual activity","Manage pain long-term","Understand condition","Prevent recurrence","Improve posture","Improve fitness","Improve flexibility","Lose weight","Improve balance","Prevent falls","Avoid surgery","Post-surgical recovery","Improve quality of life generally","Be able to garden","Do housework independently","Reduce healthcare appointments","Self-manage"] },
      { id:"pg_timeline",   label:"Patient's Desired Timeline",         type:"multicheck", options:["Immediate — wants relief now","As soon as possible","< 2 weeks","2–4 weeks","4–6 weeks","6–8 weeks","2–3 months","3–6 months","6–12 months","No specific timeline","Before a specific event (see notes)","Realistic — open to therapist guidance","Unrealistic — needs education"] },
      { id:"pg_values",     label:"What Matters Most to Patient",       type:"multicheck", options:["Being pain free","Being able to work","Being a good parent/carer","Being active and fit","Sports/athletic identity","Independence","Sleep quality","Mental health","Relationships","Social life","Career progression","Financial stability","Faith/religious practice","Avoiding surgery","Not relying on medication","Being in control of health"] },
      { id:"pg_barriers",   label:"Barriers to Achieving Goals",        type:"multicheck", options:["No significant barriers","Pain too high to exercise","Fear of movement / re-injury","Low confidence","Poor health literacy","Lack of time","Work demands","Childcare responsibilities","Carer responsibilities","Financial barriers","Transport to appointments","Language barrier","Low motivation currently","Chronic fatigue","Comorbidities limiting treatment","Social isolation","Lack of support","Poor previous experience with physiotherapy"] },
      { id:"pg_psfs",       label:"PSFS — Activity 1 (0–10)",          type:"text", placeholder:"Activity: [write activity] — Score: 0=unable, 10=normal" },
      { id:"pg_psfs2",      label:"PSFS — Activity 2 (0–10)",          type:"text", placeholder:"Activity: [write activity] — Score:" },
      { id:"pg_psfs3",      label:"PSFS — Activity 3 (0–10)",          type:"text", placeholder:"Activity: [write activity] — Score:" },
      { id:"pg_notes",      label:"Goals Notes",                       type:"textarea", placeholder:"Shared decision-making, agreed goals, clinician comments" },
    ]
  },

};

// ── NKT_REGIONS ──
const NKT_REGIONS = {
  cervical:{
    label:"Cervical / Head & Neck", color:"#00e5ff",
    intro:"The cervical NKT assessment identifies which muscles the Motor Control Centre (MCC) has inhibited in the neck and head region, and which synergists are compensating. Common compensation: DNF inhibited → SCM/scalenes overactive → forward head posture, headache, TMJ.",
    tests:[
      {
        id:"nkt_dnf", label:"Deep Neck Flexors (DNF)", muscle:"Longus colli / Longus capitis",
        compensator:"SCM, scalenes, suboccipitals",
        how:"Patient supine. Place pressure biofeedback cuff at neck (inflate to 20mmHg baseline). Ask patient to gently nod chin (craniocervical flexion — NOT a chin tuck). Gradually increase target pressure from 22 → 24 → 26 → 28 → 30mmHg holding each 10 seconds. Confirm by touching SCM during test — if SCM fires early or dominates, DNF is inhibited.",
        options:[
          { val:"Facilitated", color:"#00c97a", meaning:"DNF activates before SCM. Patient can reach 28–30mmHg without SCM firing. Normal motor control. No NKT treatment needed for DNF." },
          { val:"Inhibited", color:"#ff4d6d", meaning:"DNF cannot maintain pressure targets. SCM fires early and dominates. MCC has turned off DNF — forward head is maintained by SCM/scalenes. TREAT: release SCM/scalenes → activate DNF immediately." },
          { val:"Overactive", color:"#ffb300", meaning:"Rare. DNF may be overworking due to inhibition elsewhere (e.g. longus colli compensating for atlas instability). Presents as anterior neck pain with no relief from flexion." },
        ],
        treatment:"Release: SCM (pressure/massage) + scalenes (SMR). Activate: chin nod 10 reps × 3 sets. Home: tongue to roof of mouth posture drill. Reprogram MCC within 30 seconds of release.",
      },
      {
        id:"nkt_scm", label:"Sternocleidomastoid (SCM)", muscle:"SCM",
        compensator:"When overactive: compensating for inhibited DNF or contralateral upper trap",
        how:"Patient supine. Therapist palpates SCM (finger on muscle belly, sternal and clavicular heads). Ask patient to flex neck against resistance. SCM should only assist — if it fires hard and first, it is overactive. Therapy localization: touch SCM belly → re-test DNF. If DNF suddenly stronger = SCM is the overactive compensator.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"SCM assists neck flexion appropriately. Normal recruitment. Not compensating." },
          { val:"Overactive — compensating for DNF", color:"#ff4d6d", meaning:"SCM fires before DNF and dominates flexion. Confirmed by therapy localization. TREAT: release SCM → activate DNF. Patient often has forward head, headache, TMJ symptoms." },
          { val:"Overactive — compensating for upper trap", color:"#ffb300", meaning:"SCM overactive contralaterally to compensate for ipsilateral upper trap inhibition. Causes head tilt and rotation asymmetry." },
          { val:"Bilateral overactive", color:"#7f5af0", meaning:"Both SCMs overactive — typically compensating for inhibited core/diaphragm. Patient often has forward head with breathing dysfunction." },
        ],
        treatment:"Release: light pressure massage on SCM belly for 60–90 sec. Stretch: gentle lateral flexion opposite side. Then immediately activate: DNF chin nods. Never aggressively stretch an overactive SCM without activating DNF first.",
      },
      {
        id:"nkt_suboccip", label:"Suboccipital Muscles", muscle:"Rectus capitis posterior / Obliquus capitis",
        compensator:"When overactive: compensating for inhibited DNF or cervical flexors",
        how:"Patient prone or supine. Palpate suboccipital triangle (base of skull). Apply gentle pressure while patient slowly nods chin. Suboccipitals should relax with DNF activation. If they remain hard or increase in tone — overactive. Test: place finger on suboccipitals → re-test DNF → if DNF stronger, suboccipitals are compensating.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Suboccipitals relax when DNF activates. Normal reciprocal inhibition. No compensation pattern." },
          { val:"Overactive — DNF compensation", color:"#ff4d6d", meaning:"Suboccipitals are hard and tender. Maintain atlas extension. Patient has upper cervical pain, base of skull headache, dizziness, and restricted C0–C1 mobility. TREAT: suboccipital release → DNF activation." },
          { val:"Overactive — eye muscle compensation", color:"#ffb300", meaning:"Suboccipitals overactive due to visual compensation. Follows eye movement dysfunction. Ask patient to look in directions — if symptoms change, visual/vestibular system involved." },
        ],
        treatment:"Release: suboccipital decompression (therapist fingers under occiput, sustained gentle traction 2–3 min). Dry needling to suboccipitals if acute. Then activate DNF. Refer for eye/vestibular assessment if visual pattern present.",
      },
      {
        id:"nkt_upper_trap", label:"Upper Trapezius", muscle:"Upper trapezius / Levator scapulae",
        compensator:"When overactive: compensating for inhibited lower trapezius or DNF",
        how:"Patient seated. Therapist palpates upper trapezius (upper shoulder, fibres between neck and acromion). Apply gentle downward pressure on shoulder (shrug resistance). If upper trap fires immediately and forcefully with minimal load = overactive. Therapy localization: touch upper trap → re-test lower trapezius. If lower trap suddenly stronger = upper trap compensating for lower trap inhibition.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Upper trap fires proportionally with lower and middle trap. No shoulder elevation at rest or with light load." },
          { val:"Overactive — lower trap inhibition", color:"#ff4d6d", meaning:"Upper trap fires excessively. Shoulder visibly elevated at rest. Lower trap tests weak. TREAT: release upper trap → activate lower trap immediately. Common in desk workers, impingement." },
          { val:"Overactive — DNF inhibition", color:"#ffb300", meaning:"Upper trap overactive as distant compensation for cervical instability. Touching upper trap improves DNF test. Release upper trap → activate DNF." },
          { val:"Overactive — breathing dysfunction", color:"#7f5af0", meaning:"Upper trap overactive as accessory breathing muscle. Patient breathes into upper chest. Release upper trap + retrain diaphragmatic breathing." },
        ],
        treatment:"Release: SMR upper trap (tennis ball or foam roller). Massage: cross-fibre across fibres. Stretch: lateral neck stretch (ear to opposite shoulder). Then immediately activate lower trapezius: prone Y-exercise. Home: shoulder blade drops × 20 throughout day.",
      },
      {
        id:"nkt_scalenes", label:"Scalenes", muscle:"Anterior / Middle / Posterior scalenes",
        compensator:"When overactive: compensating for inhibited DNF, or thoracic outlet contributors",
        how:"Patient supine. Palpate scalenes (lateral neck, between SCM and levator). Ask patient to breathe in deeply — scalenes should only fire at end-range of inhalation. If they fire early in breathing = overactive as accessory breathers. Test resisted cervical side flexion — if scalenes are disproportionately active vs DNF = compensation. Therapy localization: touch scalenes → re-test DNF.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Scalenes activate only at end of deep inhalation. Appropriately assist cervical side flexion. No thoracic outlet symptoms." },
          { val:"Overactive — DNF inhibition", color:"#ff4d6d", meaning:"Scalenes fire early in breathing and dominate lateral neck. Patient has anterior neck tightness, thoracic outlet symptoms (arm tingling). TREAT: release scalenes → activate DNF." },
          { val:"Overactive — rib 1 elevation", color:"#ffb300", meaning:"Scalenes elevated first rib — thoracic outlet narrowed. Adson's test may be positive. Needs rib 1 mobilisation + scalene release." },
          { val:"Bilateral overactive — breathing pattern", color:"#7f5af0", meaning:"Both scalenes overactive as primary breathers (thoracic breathing pattern). Diaphragm inhibited. TREAT: release scalenes → diaphragmatic breathing retraining." },
        ],
        treatment:"Release: gentle scalene massage (patient supine, head rotated away, fingertip pressure on scalene belly 90 sec). Stretch: cervical extension + rotation + side flex away. Activate: diaphragmatic breathing (hand on belly, breathe in 4 sec, out 6 sec). Avoid aggressive scalene stretching without diaphragm retraining.",
      },
      { id:"nkt_levator_scap", label:"Levator Scapulae", muscle:"Levator scapulae",
        compensator:"When overactive: compensating for inhibited lower trap or DNF",
        how:"Patient seated. Palpate levator scapulae (posterior-lateral neck, C1–C4 to superior medial scapular angle). Apply firm pressure while patient attempts cervical rotation away from palpated side. POSITIVE OVERACTIVITY: muscle contracts forcefully and holds tension during scapular elevation. Therapy localization: touch levator → re-test lower trap. If lower trap suddenly stronger = levator compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Levator scapulae assists cervical side flexion and scapular elevation proportionally. Not dominant during shoulder tasks. No neck-shoulder pain with lifting." },
          { val:"Overactive — lower trap inhibition", color:"#ff4d6d", meaning:"Levator overactive elevating medial scapular angle. Lower trap inhibited. Persistent neck-shoulder pain, restricted cervical rotation. TREAT: release levator → activate lower trap." },
          { val:"Overactive — cervical instability", color:"#ffb300", meaning:"Levator overactive as cervical stabiliser when DNF inhibited. C3/C4 facet compression, restricted ipsilateral rotation. Release levator → activate DNF." },
        ],
        treatment:"Release: lacrosse ball to posterior-lateral neck 60–90 sec. Stretch: chin to opposite armpit. Activate: lower trap Y-lifts immediately. Home: scapular depression exercises × 20 reps.",
      },
      { id:"nkt_splenius", label:"Splenius Capitis / Cervicis", muscle:"Splenius capitis / Splenius cervicis",
        compensator:"When overactive: compensating for inhibited cervical flexors",
        how:"Patient prone or seated. Palpate splenius capitis (C7-T3 spinous → mastoid/occiput) and splenius cervicis (to C2/C3 transverse processes). Ask patient to extend and ipsilaterally rotate head against light resistance. POSITIVE OVERACTIVITY: fires excessively, maintains resting tone. Therapy localization: touch splenius → re-test DNF.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Splenius contributes proportionally to cervical extension and ipsilateral rotation. No excessive resting tone." },
          { val:"Overactive — unilateral", color:"#ffb300", meaning:"Unilateral overactivity: ipsilateral rotation bias, restricted contralateral rotation, ipsilateral headache to orbit. TREAT: release unilateral splenius → activate DNF." },
          { val:"Overactive — bilateral", color:"#ff4d6d", meaning:"Bilateral overactivity forces cervical hyperextension and suboccipital compression. TREAT: release bilateral splenius → activate DNF." },
        ],
        treatment:"Release: fingertip pressure to splenius belly 60 sec each side. Cervical flexion stretch. Activate: DNF chin nods immediately. Home: gentle cervical flexion ROM × 10 reps.",
      },
      { id:"nkt_semispinalis", label:"Semispinalis Capitis / Cervicis", muscle:"Semispinalis capitis / cervicis",
        compensator:"When overactive: compensating for inhibited deep cervical stabilisers",
        how:"Patient prone. Palpate semispinalis (posterior neck between spinous processes and mastoid — deep to upper trap, superficial to multifidus). Ask patient to extend head against gentle resistance. POSITIVE OVERACTIVITY: palpable firmness at rest, neck extension ROM excessive relative to flexor strength. Therapy localization: touch semispinalis → re-test DNF.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"Semispinalis contributes to cervical extension and bilateral contralateral rotation. Balanced with DNF. No posterior neck tension at rest." },
          { val:"Overactive — DNF inhibition", color:"#ff4d6d", meaning:"Semispinalis overactive producing posterior cervical tension and compression. Suboccipital headache, C-spine stiffness, restricted flexion. TREAT: release semispinalis → activate DNF." },
          { val:"Overactive — thoracic kyphosis compensation", color:"#ffb300", meaning:"Semispinalis hyperextending cervical spine to correct for thoracic kyphosis. Extended cervical posture despite thoracic flexion. Address thoracic extension mobility first." },
        ],
        treatment:"Release: slow sustained pressure along posterior cervical paraspinals 60–90 sec. Activate: DNF chin nods. Address thoracic posture with foam roller extension if kyphosis is driver.",
      },
    ]
  },

  shoulder:{
    label:"Shoulder & Scapula", color:"#7f5af0",
    intro:"Shoulder NKT identifies which rotator cuff and scapular muscles are inhibited, and which are compensating. Classic patterns: lower trap inhibited → upper trap overactive | serratus inhibited → pec minor overactive | RC inhibited → biceps/pec major overactive.",
    tests:[
      {
        id:"nkt_lower_trap", label:"Lower Trapezius", muscle:"Lower trapezius",
        compensator:"When inhibited: upper trapezius, levator scapulae compensate",
        how:"Patient prone, arm abducted 120–135° (Y position). Ask patient to lift arm toward ceiling (shoulder extension in Y). Apply gentle downward resistance at distal humerus. Lower trap should fire to stabilise scapula. POSITIVE INHIBITION = cannot hold position or upper trap/neck fires to compensate. Therapy localization: touch upper trap → re-test lower trap. If lower trap suddenly stronger = upper trap compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Lower trap activates strongly in Y position. Scapula depresses and retracts appropriately. No compensation from upper trap. Normal scapulohumeral rhythm." },
          { val:"Inhibited — mild", color:"#ffb300", meaning:"Lower trap activates but fatigues quickly or upper trap fires simultaneously. Mild compensation. Patient may have intermittent shoulder pain with overhead activities. Begin isolated lower trap activation." },
          { val:"Inhibited — moderate", color:"#ff4d6d", meaning:"Lower trap cannot hold position. Upper trap immediately compensates (shoulder rises). MCC has assigned upper trap as stabiliser. Patient has chronic shoulder/neck pain, impingement pattern. TREAT: release upper trap → activate lower trap." },
          { val:"Inhibited — severe", color:"#7f5af0", meaning:"Lower trap completely inhibited. Cannot perform Y position test. Scapular winging or severe elevation present. Upper trap, levator AND rhomboids all compensating. Multiple release/activate cycles needed." },
        ],
        treatment:"Release overactive: upper trap SMR + levator scapulae massage (60–90 sec each). Activate immediately: prone Y-lifts × 5 reps, wall slide with scapular depression, cable pull-down with scapular depression. Home: doorframe lower trap sets × 20 reps throughout day.",
      },
      {
        id:"nkt_serratus", label:"Serratus Anterior", muscle:"Serratus anterior",
        compensator:"When inhibited: pectoralis minor overactive",
        how:"Patient performs wall push-up. Observe scapular position during push-up plus phase (full protraction at top). If medial border of scapula wings away from thorax = serratus inhibited. Manual test: patient pushes arm into therapist's hand (forward protraction). Apply resistance. POSITIVE INHIBITION = scapula wings or cannot protract against resistance. Therapy localization: touch pec minor → re-test serratus. If serratus stronger = pec minor compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Serratus activates to protract and upwardly rotate scapula. No winging on push-up plus. Scapula hugs thorax throughout arm elevation. Normal scapulohumeral rhythm." },
          { val:"Inhibited — functional winging", color:"#ffb300", meaning:"Serratus inhibited under load but not at rest. Winging appears only with push-up or arm elevation. Pec minor is tight and overactive. Patient has anterior shoulder pain with overhead activities." },
          { val:"Inhibited — resting winging", color:"#ff4d6d", meaning:"Scapular winging visible at rest (medial border away from thorax). Serratus severely inhibited. Pec minor chronically overactive. Long thoracic nerve palsy must be ruled out. TREAT: release pec minor → activate serratus." },
          { val:"Long thoracic nerve palsy", color:"#7f5af0", meaning:"Complete serratus inhibition with severe winging. No voluntary activation possible. Neurological cause — C5/6/7 long thoracic nerve affected. Refer for nerve conduction study. NKT technique may still help partial cases." },
        ],
        treatment:"Release: pec minor (supine, firm pressure at coracoid process to 3rd–5th ribs, 90 sec). Activate: serratus punches (supine, arm at 90°, push fist toward ceiling adding protraction), push-up plus. Home: wall protraction holds × 10 reps, serratus activation in quadruped.",
      },
      {
        id:"nkt_infraspinatus", label:"Infraspinatus / Teres Minor", muscle:"Infraspinatus / Teres minor",
        compensator:"When inhibited: posterior deltoid, biceps compensate",
        how:"Patient seated or sidelying. Elbow at 90°, arm at side. Apply gentle resistance to external rotation. POSITIVE INHIBITION = cannot resist external rotation with adequate force, or posterior deltoid/biceps dominates. Therapy localization: touch posterior deltoid or biceps → re-test IR. If ER suddenly stronger = deltoid/biceps compensating for RC.",
        options:[
          { val:"Facilitated — strong", color:"#00c97a", meaning:"Infraspinatus/teres minor generate adequate ER force at 0° and 90°. No compensation from posterior deltoid. Normal rotator cuff function." },
          { val:"Inhibited — pain inhibition", color:"#ffb300", meaning:"Inhibited due to pain (strong & painful = minor lesion per Cyriax). Pain prevents full activation. Address pain first (DTFM, dry needling) then NKT re-test." },
          { val:"Inhibited — motor control", color:"#ff4d6d", meaning:"ER weak and painless. MCC has inhibited infraspinatus — posterior deltoid compensates for humeral head depression. Patient has shoulder impingement pattern. TREAT: release pec minor/posterior deltoid → activate IR." },
          { val:"Complete inhibition — possible tear", color:"#7f5af0", meaning:"No ER activation possible. Consider structural tear — refer for imaging (MRI/ultrasound). External rotation lag sign likely positive." },
        ],
        treatment:"Release: pec minor + anterior deltoid (both overactive compensators, SMR 60 sec). Dry needling to infraspinatus if trigger points present. Activate: sidelying ER with theraband (light resistance, slow and controlled). Home: doorframe ER isometric × 20 reps.",
      },
      {
        id:"nkt_subscapularis", label:"Subscapularis", muscle:"Subscapularis",
        compensator:"When inhibited: pec major, teres major compensate",
        how:"Patient seated or supine. Elbow 90°, arm at side. Resist internal rotation. Subscapularis is the primary IR and anterior stabiliser. POSITIVE INHIBITION = weak IR or pec major fires to compensate (you can see/feel pec major dominating). Lift-off test: patient places dorsum of hand on low back and lifts it off — cannot = subscapularis inhibited. Belly press test: press hand into abdomen without wrist flexing — cannot = subscapularis inhibited.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Strong IR at 0° and 45°. Can perform lift-off and belly press without compensation. Normal anterior GH stability." },
          { val:"Inhibited — instability pattern", color:"#ffb300", meaning:"IR weak, pec major compensates. Patient has anterior shoulder instability, pain with IR. Apprehension test may be positive. TREAT: release pec major → activate subscapularis." },
          { val:"Inhibited — post-surgical", color:"#ff4d6d", meaning:"Subscapularis inhibited after shoulder surgery (Bankart, SLAP repair, total shoulder). MCC 'switched off' subscapularis due to surgical trauma. Therapy localization confirms. Progressive NKT activation essential for return to function." },
          { val:"Complete inhibition", color:"#7f5af0", meaning:"Cannot perform any IR. Lift-off completely failed. Possible subscapularis tear — refer for imaging. Belly press = wrist flexion to compensate." },
        ],
        treatment:"Release: pec major SMR + anterior deltoid massage. Activate: sidelying IR with theraband, belly press holds, lift-off progression. Home: theraband IR × 20 reps, progress to 90/90 IR.",
      },
      {
        id:"nkt_mid_trap", label:"Middle Trapezius / Rhomboids", muscle:"Middle trapezius / Rhomboids",
        compensator:"When inhibited: levator scapulae, upper trap compensate",
        how:"Patient prone, arm at 90° (T position). Retract and depress scapula while lifting arm. Apply resistance at posterior humerus. POSITIVE INHIBITION = scapula protracts under load, or levator scapulae fires to elevate rather than retract. Therapy localization: touch levator → re-test mid trap. If stronger = levator compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Middle trap retracts scapula strongly without elevation. Scapulae symmetric in prone. Normal retraction strength." },
          { val:"Inhibited — protraction bias", color:"#ffb300", meaning:"Mild weakness. Scapula protracts under resistance. Patient has rounded shoulders but not severe. Levator scapulae partially compensating." },
          { val:"Inhibited — levator dominant", color:"#ff4d6d", meaning:"Scapula elevates instead of retracting under load. Levator fully compensating for mid trap. Patient has upper neck pain and shoulder elevation at rest. TREAT: release levator → activate middle trap." },
        ],
        treatment:"Release: levator scapulae (pressure at superior angle of scapula, 60 sec). SMR upper neck region. Activate: prone T-lifts, seated cable rows with scapular retraction focus. Home: wall angel exercise × 15 reps.",
      },
      { id:"nkt_pec_minor", label:"Pectoralis Minor", muscle:"Pectoralis minor",
        compensator:"When overactive: compensating for inhibited serratus anterior",
        how:"Patient supine. Palpate pec minor at coracoid process (just below and medial to the coracoid tip, between coracoid and 3-5th ribs). Apply firm pressure medially toward ribs. POSITIVE OVERACTIVITY: extreme tenderness, scapular protraction (shoulder rolls forward at rest), restricted scapular retraction. Test: therapist passively retract scapula — if very restricted = pec minor shortened. Therapy localization: touch pec minor → re-test serratus.",
        options:[
          { val:"Normal length and tone", color:"#00c97a", meaning:"Pec minor not tender at rest. Scapula rests neutrally — not protracted. Serratus anterior not inhibited. Full passive scapular retraction available." },
          { val:"Overactive — serratus inhibition", color:"#ff4d6d", meaning:"Pec minor overactive, shortened. Scapular protraction at rest. Serratus inhibited. Patient has anterior shoulder pain, impingement pattern, rounded shoulder posture. TREAT: release pec minor → activate serratus." },
          { val:"Overactive — thoracic outlet", color:"#ffb300", meaning:"Pec minor compressing neurovascular bundle (brachial plexus, subclavian vessels). Arm tingling especially in overhead position. Coracoid hyperalgesic. Release pec minor + neural mobilisation." },
        ],
        treatment:"Release: supine coracoid-to-rib pressure technique 90 sec. Door-stretch pec minor (hand at 90° abduction, lean through doorframe). Activate: serratus punches immediately. Home: pec minor self-release with ball × 2 min daily.",
      },
      { id:"nkt_ant_deltoid", label:"Anterior Deltoid", muscle:"Anterior deltoid",
        compensator:"When overactive: compensating for inhibited rotator cuff (supraspinatus/infraspinatus)",
        how:"Patient seated. Palpate anterior deltoid (anterior shoulder, below clavicle). Resist shoulder flexion at 90°. POSITIVE OVERACTIVITY: anterior deltoid fires powerfully and dominates — palpation reveals hard, tender muscle belly. Humeral head translates anteriorly during shoulder elevation. Therapy localization: touch anterior deltoid → re-test supraspinatus. If supraspinatus stronger = anterior deltoid compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Anterior deltoid assists shoulder flexion proportionally. No anterior humeral head translation. Rotator cuff centring maintained throughout elevation." },
          { val:"Overactive — RC inhibition", color:"#ff4d6d", meaning:"Anterior deltoid dominates shoulder flexion. Humeral head migrates anteriorly/superiorly. Impingement pattern. Patient has anterior shoulder pain on flexion. TREAT: release anterior deltoid → activate infraspinatus/supraspinatus." },
          { val:"Overactive — biceps compensation", color:"#ffb300", meaning:"Anterior deltoid + biceps both overactive as RC compensators. Shoulder flexion with elbow flexion tendency. Bicipital groove tender. Release anterior deltoid + biceps → activate RC." },
        ],
        treatment:"Release: cross-fibre massage to anterior deltoid belly 60 sec. Activate: sidelying ER for infraspinatus. Home: doorframe stretch in neutral rotation.",
      },
      { id:"nkt_post_deltoid", label:"Posterior Deltoid", muscle:"Posterior deltoid",
        compensator:"When overactive: compensating for inhibited infraspinatus / teres minor",
        how:"Patient prone or seated. Palpate posterior deltoid (posterior shoulder). Resist shoulder horizontal abduction (arm at 90° flex, pull backward against resistance). POSITIVE OVERACTIVITY: posterior deltoid fires with disproportionate force relative to infraspinatus. Infraspinatus tests weak. Therapy localization: touch posterior deltoid → re-test infraspinatus ER.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Posterior deltoid assists horizontal abduction proportionally. Infraspinatus/teres minor provide adequate ER. No dominance of posterior deltoid in ER." },
          { val:"Overactive — IR compensation", color:"#ff4d6d", meaning:"Posterior deltoid compensates for inhibited infraspinatus. ER dominated by deltoid not RC. Posterior shoulder tightness. TREAT: release posterior deltoid → activate infraspinatus." },
        ],
        treatment:"Release: cross-fibre massage to posterior deltoid 60 sec. Activate: sidelying ER with theraband (infraspinatus isolation). Home: ER doorframe isometric.",
      },
      { id:"nkt_teres_major", label:"Teres Major", muscle:"Teres major",
        compensator:"When overactive: compensating for inhibited subscapularis or lat dorsi",
        how:"Patient sidelying or prone. Palpate teres major (posterior axillary fold, between inferior angle of scapula and humerus). Apply gentle resistance to internal rotation. POSITIVE OVERACTIVITY: teres major fires powerfully and tenderly. Often confused with lat dorsi. Test: resist shoulder adduction from 90° abduction — if teres major dominates = overactive. Therapy localization: touch teres major → re-test subscapularis.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Teres major assists IR and adduction proportionally. Subscapularis not inhibited. No posterior axillary tension." },
          { val:"Overactive — subscapularis inhibition", color:"#ff4d6d", meaning:"Teres major overactive compensating for subscapularis. Medial rotation with adduction pattern. Posterior axillary fold tight. TREAT: release teres major → activate subscapularis." },
          { val:"Overactive — lat dorsi compensation", color:"#ffb300", meaning:"Teres major + lat dorsi both overactive. Shoulder locked in extension/adduction/IR. Overhead reaching severely restricted. Release both → activate lower trap and serratus." },
        ],
        treatment:"Release: fingertip pressure to teres major belly at posterior axillary fold 60–90 sec. Activate: subscapularis (belly press or IR in neutral). Home: overhead reach stretch with scapular upward rotation cue.",
      },
    ]
  },

  core:{
    label:"Core & Lumbar", color:"#00c97a",
    intro:"Core NKT identifies which deep stabilisers the MCC has inhibited following injury, poor posture, or prolonged sitting. Classic patterns: TA inhibited → erector spinae overactive | multifidus inhibited → superficial back muscles compensate | diaphragm inhibited → accessory breathers (scalenes, SCM) overactive.",
    tests:[
      {
        id:"nkt_ta", label:"Transversus Abdominis (TA)", muscle:"Transversus abdominis",
        compensator:"When inhibited: erector spinae, rectus abdominis compensate",
        how:"Patient supine, knees bent. Ask patient to draw navel gently toward spine WITHOUT holding breath or flattening lumbar spine. Place fingers 2cm medial and inferior to ASIS — feel for gentle tensioning of lower abdomen. If erector spinae fires instead (back arches), or patient holds breath = TA inhibited. Pressure biofeedback (prone): inflate to 70mmHg. Ask to draw in — normal = 4–10mmHg DECREASE. More than 10mmHg decrease = RA compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"TA activates independently with drawing-in manoeuvre. No breath holding. Lumbar spine neutral. Pressure biofeedback shows 4–10mmHg decrease. Core precedes limb movement (normal feedforward activation)." },
          { val:"Inhibited — erector spinae dominant", color:"#ff4d6d", meaning:"TA cannot activate. Erector spinae fires instead (back extends/arches). Patient has chronic LBP pattern. MCC assigned spinal extensors as stabilisers. TREAT: release erector spinae → activate TA. Most common finding in chronic LBP." },
          { val:"Inhibited — breath-holding pattern", color:"#ffb300", meaning:"Patient braces with Valsalva rather than subtle TA activation. Intra-abdominal pressure elevated constantly. TA never activates independently. Indicative of chronic spinal instability fear-avoidance." },
          { val:"Inhibited — RA dominant", color:"#7f5af0", meaning:"Rectus abdominis fires instead of TA. Abdomen protrudes on activation attempt or flattens dramatically. TA completely bypassed. Pressure biofeedback shows >10mmHg decrease. Requires extensive TA isolation practice." },
        ],
        treatment:"Release: erector spinae SMR (foam roll thoracolumbar region, 90 sec each side). Activate: abdominal drawing-in manoeuvre × 10 reps (holding 10 sec), progress to dead bug. Home: TA activation every hour, integrate into all daily movement.",
      },
      {
        id:"nkt_multifidus", label:"Multifidus", muscle:"Multifidus",
        compensator:"When inhibited: superficial erector spinae, QL compensate",
        how:"Patient prone. Palpate paraspinal groove just lateral to spinous processes at L4/L5. Ask patient to gently swell the muscle outward WITHOUT moving the spine or contracting buttocks. If superficial erector fires (hard and broad contraction) instead of local deep swelling = multifidus inhibited. Ultrasound imaging gold standard. Clinical test: observe spine stability during single-leg balance — if excessive spinal movement = multifidus deficit.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Multifidus produces gentle local swelling at palpated level. Segmental stabilisation present. Normal spinal control during limb movements. Rapid re-activation after acute episode." },
          { val:"Inhibited — unilateral", color:"#ffb300", meaning:"Asymmetric multifidus activation. One side inhibited (often side of prior disc herniation or LBP episode). Compensatory erector spinae and QL overactivity on that side. Patient has asymmetric LBP and trunk rotation weakness." },
          { val:"Inhibited — bilateral", color:"#ff4d6d", meaning:"Both sides inhibited. Spinal extensors completely compensating. Patient has chronic, diffuse LBP with poor spinal segmental control. Core exercises targeting global muscles (crunches, deadlifts) worsen the pattern." },
          { val:"Atrophied (post-injury)", color:"#7f5af0", meaning:"Multifidus atrophied after disc herniation or surgery. Atrophy may be visible on MRI. Slow to recover — requires specific activation. NKT therapy localization confirms which superficial muscles are compensating." },
        ],
        treatment:"Release: thoracolumbar erector spinae SMR + QL pressure release. Activate: prone multifidus swelling × 10 sec holds × 10 reps, progress to quadruped arm/leg (bird-dog), then standing. Home: seated multifidus activation throughout day.",
      },
      {
        id:"nkt_diaphragm", label:"Diaphragm", muscle:"Diaphragm",
        compensator:"When inhibited: scalenes, SCM, intercostals compensate as accessory breathers",
        how:"Patient supine or seated. Observe breathing pattern: place one hand on chest, one on abdomen. Normal: abdomen rises first (diaphragm descends). POSITIVE INHIBITION = chest rises first (accessory breathing). Formal test: ask patient to breathe in deeply — if scalenes and SCM fire visibly on normal tidal breathing = diaphragm inhibited. Palpate lateral ribcage — diaphragm should expand ribcage laterally (360°). Therapy localization: touch scalenes → re-test diaphragm activation. If better = scalenes compensating for diaphragm.",
        options:[
          { val:"Normal — diaphragmatic", color:"#00c97a", meaning:"Abdomen rises first. Ribcage expands 360° laterally. Scalenes and SCM only fire on deep inhalation (3rd respiratory phase). Normal breathing pattern. Diaphragm also provides core stability contribution." },
          { val:"Inhibited — thoracic breathing", color:"#ff4d6d", meaning:"Chest rises first. Scalenes and SCM fire on every breath. Diaphragm inhibited — not descending. Patient has chronic neck tightness, upper trap pain, anxiety, and reduced lumbar stability (diaphragm contributes to IAP). TREAT: release scalenes + SCM → activate diaphragmatic breathing." },
          { val:"Inhibited — paradoxical", color:"#7f5af0", meaning:"Abdomen paradoxically moves IN on inhalation (diaphragm not descending, scalenes/accessory muscles pulling chest up only). Significant breathing dysfunction. May indicate phrenic nerve involvement or chronic postural dysfunction." },
          { val:"Inhibited — lateral expansion deficit", color:"#ffb300", meaning:"Some diaphragmatic activation but ribcage does not expand laterally — only rises. Posterior and lateral diaphragm fibres inhibited. Patient has reduced thoracolumbar fascia tension and core stability. Lateral rib expansion breathing retraining required." },
        ],
        treatment:"Release: scalenes + SCM massage (90 sec each). Activate: 360° diaphragmatic breathing (crocodile breathing — prone on floor, breathe into posterior ribcage), lateral rib expansion training. Home: diaphragmatic breathing × 10 breaths before sleep, throughout day. Address anxiety/stress contributing to thoracic breathing.",
      },
      {
        id:"nkt_ql", label:"Quadratus Lumborum (QL)", muscle:"Quadratus lumborum",
        compensator:"When overactive: compensating for inhibited glute med or multifidus",
        how:"Patient sidelying. Palpate between 12th rib and iliac crest (lateral lumbar). Ask patient to hike hip (lateral trunk flexion). Normal: QL fires as hip hiker. Overactive QL: fires excessively when it shouldn't — during hip extension (should be glute max), during abduction (should be glute med). Test: ask for hip extension in prone — if QL fires instead of glute max = QL compensating. Therapy localization: touch QL → re-test glute max or glute med. If glute fires better = QL is compensating.",
        options:[
          { val:"Normal activation", color:"#00c97a", meaning:"QL fires for lateral flexion and as respiratory stabiliser. Does not fire excessively during hip extension or abduction. Normal lumbar side stability." },
          { val:"Overactive — glute max compensation", color:"#ff4d6d", meaning:"QL fires during hip extension instead of glute max. Patient extends hip by tilting pelvis (QL) rather than extending at hip joint. Common LBP pattern. TREAT: release QL → activate glute max immediately." },
          { val:"Overactive — glute med compensation", color:"#ffb300", meaning:"QL hikes hip during walking/running instead of glute med abducting it. Patient has lateral hip pain, IT band syndrome, and Trendelenburg-equivalent pattern with QL dominance. TREAT: release QL → activate glute med." },
          { val:"Overactive — bilateral (LBP pattern)", color:"#7f5af0", meaning:"Both QLs chronically overactive. Patient cannot sit comfortably. Lateral lumbar pain bilateral. Both glute max and glute med inhibited. Multiple compensation layers — treat sequentially." },
        ],
        treatment:"Release: QL SMR (tennis ball at lateral lumbar between rib and iliac crest, 90 sec). Activate: glute max (bridges) immediately after, then glute med (side-lying abduction). Home: avoid crossing legs when sitting (increases QL asymmetry).",
      },
      {
        id:"nkt_psoas", label:"Iliopsoas (Psoas + Iliacus)", muscle:"Iliopsoas",
        compensator:"When overactive: compensating for inhibited glutes/TA; inhibited: rare, usually overactive",
        how:"Patient supine. Apply gentle resistance to hip flexion (hand on distal thigh). Normal: iliopsoas activates smoothly. Test for overactivity: is hip flexion painful or does lumbar spine extend (anterior tilt) during hip flexion? = psoas overactive pulling lumbar into extension. Thomas test: if hip cannot reach table = iliopsoas shortened/overactive. Therapy localization: touch iliopsoas (gentle pressure at inguinal region) → re-test TA or glute max. If stronger = psoas compensating.",
        options:[
          { val:"Normal length and activation", color:"#00c97a", meaning:"Hip flexes without lumbar extension. Thomas test negative. No groin pain. Psoas activates proportionally and does not pull spine forward. Appropriate hip flexion strength for activity level." },
          { val:"Overactive — anterior pelvic tilt", color:"#ff4d6d", meaning:"Psoas pulls lumbar into extension during hip flexion. Thomas test positive (hip remains elevated). Lumbar lordosis increased. Patient has LBP worsened by sitting and hip flexion. TREAT: release psoas → activate TA + glute max." },
          { val:"Overactive — glute inhibition", color:"#ffb300", meaning:"Psoas overactive because glute max is inhibited — psoas must do both flexion and extension stabilisation. Hip snapping (coxa saltans) may be present. Groin pain and anterior hip impingement symptoms." },
          { val:"Inhibited (rare)", color:"#7f5af0", meaning:"Psoas truly inhibited — weak hip flexion in fully shortened range. Rare. May indicate L2/3 nerve root involvement or hip flexor avulsion injury. Confirm with Cyriax resisted test." },
        ],
        treatment:"Release: psoas stretch (kneeling lunge, posterior pelvic tilt), SMR quads/hip flexors. Activate: TA drawing-in, glute bridges with focus on not allowing anterior tilt. Never aggressive psoas stretching without core activation.",
      },
      { id:"nkt_erector_spinae", label:"Erector Spinae", muscle:"Iliocostalis / Longissimus / Spinalis",
        compensator:"When overactive: compensating for inhibited TA, multifidus, or glute max",
        how:"Patient prone. Palpate erector spinae (lateral to spinous processes L1–L5 and thoracic). Ask patient to attempt TA activation (drawing-in) — if erector spinae fire instead of TA = overactive compensation. Test: ask patient to perform hip extension — if lumbar extensors fire before glute max = erector overactive as hip extensor substitute. Note: overactive erectors feel hard and tender at rest. Therapy localization: touch erectors → re-test TA or glute max.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Erector spinae active during lumbar extension tasks only. Not firing during TA activation attempts. Not dominant in hip extension. Normal resting tone." },
          { val:"Overactive — TA inhibition", color:"#ff4d6d", meaning:"Erectors fire during every attempted TA activation. Patient cannot isolate deep stabilisers. Core training is superficial muscle dominant. Chronic LBP pattern. TREAT: release erectors → activate TA immediately." },
          { val:"Overactive — glute max inhibition", color:"#ffb300", meaning:"Erectors fire during hip extension (creating lumbar extension to simulate hip extension). Deadlift and squat form breakdown. Lumbar pain with hip extension movements. TREAT: release erectors → activate glute max." },
          { val:"Overactive — bilateral lumbar spasm", color:"#7f5af0", meaning:"Bilateral erector spasm. Cannot relax lumbar musculature. Acute or chronic spasm pattern. Thoracolumbar fascia under constant tension. Treat: heat + SMR + TA activation in non-provoked positions." },
        ],
        treatment:"Release: foam roller thoracolumbar paraspinals (slow roll T12–L5, 90 sec). SMR with lacrosse ball lateral to spinous processes. Activate: TA drawing-in immediately, progress to bird-dog. Home: TA awareness during all daily movement.",
      },
      { id:"nkt_obliques", label:"Internal / External Obliques", muscle:"Internal oblique / External oblique",
        compensator:"When inhibited: erector spinae and QL compensate for rotation control",
        how:"Patient supine. Test: resist trunk rotation (patient attempts to rotate shoulders — therapist resists at shoulder). Feel and observe: if patient substitutes with hip hiking (QL) or lateral trunk flexion rather than rotation = obliques inhibited. Pallof press test: attach resistance band at side — patient holds band at sternum and resists rotation. If core collapses or rotates = oblique weakness. Therapy localization: touch QL or erectors → re-test anti-rotation strength. If stronger = obliques inhibited.",
        options:[
          { val:"Normal anti-rotation control", color:"#00c97a", meaning:"Obliques generate adequate trunk rotation and anti-rotation force. Pallof press held without collapse. Gait shows appropriate trunk counter-rotation with arm swing. No lateral trunk bending substitution." },
          { val:"Inhibited — rotation substitution", color:"#ff4d6d", meaning:"Obliques cannot resist rotation — QL and erectors substitute. Trunk rotates excessively during single-leg activities. Poor throwing/golf/tennis mechanics. TREAT: release QL → activate obliques (Pallof press, dead bug with rotation)." },
          { val:"Inhibited — post-partum / diastasis recti", color:"#ffb300", meaning:"Obliques inhibited following pregnancy/diastasis recti. Poor linea alba tension. Belly protrudes during sit-up attempts. Oblique activation must be performed without increasing intra-abdominal pressure. TREAT: TA first, then obliques." },
        ],
        treatment:"Release: QL and lateral lumbar SMR. Activate: Pallof press × 10 reps each side, dead bug with rotation, cable woodchops. Home: side plank progression × 3 × 20 sec.",
      },
      { id:"nkt_pelvic_floor", label:"Pelvic Floor", muscle:"Levator ani / Coccygeus / Sphincters",
        compensator:"When inhibited: superficial hip flexors overactive; when overactive: thigh adductors and piriformis co-contract",
        how:"Patient seated or supine. Observe breathing pattern — normal pelvic floor coordinates with diaphragm (descends on inhalation, rises on exhalation). Test: ask patient to gently activate pelvic floor (Kegel) without activating glutes or abductors. OVERACTIVITY: patient is hypervigilant, pain with palpation of inner thigh/perineum, cannot relax floor; INHIBITION: pelvic floor cannot resist Valsalva — stress incontinence. Therapy localization: touch adductors → re-test pelvic floor coordination.",
        options:[
          { val:"Normal coordination with breath", color:"#00c97a", meaning:"Pelvic floor activates and relaxes with breathing cycle. No stress incontinence. No pelvic pain. Coordinates with TA and diaphragm for IAP management." },
          { val:"Inhibited — stress incontinence pattern", color:"#ff4d6d", meaning:"Pelvic floor cannot generate adequate tension. Leakage with cough, jump, or sneeze. Often post-partum or post-pelvic surgery. TREAT: activate TA → coordinate with pelvic floor Kegel. Refer to pelvic physiotherapist." },
          { val:"Overactive — hypertonic pattern", color:"#ffb300", meaning:"Pelvic floor chronically contracted. Cannot relax. Pelvic pain, dyspareunia, tail bone pain. Adductors and piriformis also tight. TREAT: pelvic floor downtraining (relaxation breathing), adductor release." },
        ],
        treatment:"Inhibited: Kegel × 10 reps in coordination with exhalation, integrated TA + pelvic floor activation. Overactive: pelvic floor relaxation in hooklying with diaphragm breathing, adductor stretch, piriformis release. Refer to pelvic floor physiotherapist for complex presentations.",
      },
    ]
  },

  hip:{
    label:"Hip & Pelvis", color:"#f97316",
    intro:"Hip NKT identifies gluteal inhibition and compensation patterns. The most common global pattern: gluteus maximus inhibited → hamstrings and QL overactive → chronic LBP and hamstring strains. Gluteus medius inhibited → TFL and piriformis overactive → IT band, lateral hip pain, and Trendelenburg gait.",
    tests:[
      {
        id:"nkt_gmax", label:"Gluteus Maximus", muscle:"Gluteus maximus",
        compensator:"When inhibited: hamstrings, QL, piriformis compensate",
        how:"Patient prone. Ask for hip extension with knee bent (reduces hamstring contribution). Palpate both gluteus maximus and hamstrings simultaneously. Watch and feel which fires first. Normal: glute fires before hamstring. POSITIVE INHIBITION: hamstring fires first or glute never activates. Therapy localization: place one hand on hamstring and one on QL → re-test glute max contraction. If glute gets firmer with these contacts = confirmed compensation. Single-leg bridge test: patient bridges — if hamstring cramps or QL fires instead of glute = glute max inhibited.",
        options:[
          { val:"Facilitated — fires first", color:"#00c97a", meaning:"Gluteus maximus activates before hamstrings in prone hip extension. Full activation in bridge. No QL firing. Normal hip extension power and lumbar stability. Glute drives force through hip joint appropriately." },
          { val:"Inhibited — hamstring dominant", color:"#ffb300", meaning:"Hamstring fires first or simultaneously with glute. Glute activates late and weakly. Patient often has recurrent hamstring strains and chronic LBP. Hip extension generated by knee flexion (hamstring) not hip joint extension (glute). TREAT: release hamstrings → activate glute max immediately." },
          { val:"Inhibited — QL dominant", color:"#ff4d6d", meaning:"QL fires instead of glute max for hip extension. Patient extends spine (lateral tilt) to create apparent hip extension. Classic LBP pattern. Lateral lumbar pain and poor deadlift/hinge mechanics. TREAT: release QL → activate glute max." },
          { val:"Inhibited — bilateral, severe", color:"#7f5af0", meaning:"Both glutes inhibited. Patient cannot activate glutes in any position. Hamstrings, QL, and erector spinae all compensating. Patient has bilateral LBP, poor single-leg stability, and hip flexion-dominant movement pattern. Multiple-session NKT approach needed." },
        ],
        treatment:"Release: hamstrings SMR (foam roll posterior thigh 90 sec) + QL release (tennis ball lateral lumbar). Activate IMMEDIATELY within 30 seconds: glute bridges × 5 slow reps (focus on feeling glute, not hamstring), clamshells. Home: glute squeeze at top of every step throughout day.",
      },
      {
        id:"nkt_gmed", label:"Gluteus Medius", muscle:"Gluteus medius",
        compensator:"When inhibited: TFL, piriformis, QL compensate",
        how:"Patient sidelying. Hip abduction with slight extension and IR (targets posterior glute med fibres). Apply gentle resistance above knee. Normal: glute med fires. POSITIVE INHIBITION: TFL dominates (patient rolls slightly forward — anterior tilt during abduction) or QL hikes hip instead of abducting. Standing test: Trendelenburg — single-leg stance, observe contralateral pelvis. If drops = glute med inhibited on standing leg. Therapy localization: touch TFL → re-test glute med. If stronger = TFL compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Glute med fires and holds abduction against resistance without pelvic tilt or TFL compensation. Trendelenburg negative. Normal single-leg pelvic stability. Gait shows no hip drop." },
          { val:"Inhibited — TFL dominant", color:"#ffb300", meaning:"TFL fires first — patient rolls into hip flexion during abduction (TFL is hip flexor + abductor). Lateral hip and knee pain. IT band tight. TREAT: release TFL → activate glute med (in slight extension, not flexion, to prevent TFL from dominating)." },
          { val:"Inhibited — piriformis dominant", color:"#ff4d6d", meaning:"Piriformis compensates for glute med — provides ER and abduction. Deep buttock pain. May mimic sciatica. Trendelenburg positive. TREAT: release piriformis → activate glute med." },
          { val:"Inhibited — QL dominant (Trendelenburg)", color:"#7f5af0", meaning:"QL hikes hip instead of glute med abducting it. Lateral trunk lean during gait. Classic Trendelenburg equivalent with trunk sway. Patient compensates by leaning over stance leg. TREAT: release QL → activate glute med." },
        ],
        treatment:"Release: TFL SMR (foam roll lateral hip, 90 sec), piriformis stretch + pressure. Activate: clamshells (slight hip extension, NOT flexion), sidelying hip abduction in extension, monster walks. Home: glute med activation every single-leg stance (standing in queue, brushing teeth).",
      },
      {
        id:"nkt_piriformis", label:"Piriformis", muscle:"Piriformis",
        compensator:"When overactive: compensating for inhibited glute med or glute max",
        how:"Patient prone or sidelying. Palpate piriformis (deep buttock, between PSIS and greater trochanter). If tender to palpation = active trigger points. Test: hip ER in prone — piriformis should contribute but not dominate. Overactivity test: flex hip 60° (piriformis becomes IR when hip flexed) and apply ER resistance — if this reproduces buttock pain = piriformis overactive. FAIR test: patient sidelying, affected side up, hip 60° flex, knee 90° — apply adduction + IR force. Positive = buttock pain. Therapy localization: touch piriformis → re-test glute med or glute max.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Piriformis contributes to ER appropriately. Not tender on palpation. No sciatic symptoms. Activates with hip ER without dominating the movement pattern." },
          { val:"Overactive — glute med compensation", color:"#ffb300", meaning:"Piriformis compensating for inhibited glute med. Deep buttock pain and lateral hip aching. Piriformis tender on palpation. Often causes pseudo-sciatica. TREAT: release piriformis → activate glute med." },
          { val:"Overactive — piriformis syndrome", color:"#ff4d6d", meaning:"Piriformis severely overactive. Compressing sciatic nerve (piriformis syndrome). Sciatica symptoms present (buttock to posterior thigh). SLR may be positive. FAIR test positive. TREAT: release piriformis (careful deep pressure, 90 sec) → activate glute med." },
          { val:"Overactive — glute max compensation", color:"#7f5af0", meaning:"Piriformis compensating for inhibited glute max during hip extension. Patient extends hip with lateral rotation (piriformis) rather than sagittal extension (glute max). Walking pattern shows toe-out on affected side. TREAT: release piriformis → activate glute max." },
        ],
        treatment:"Release: piriformis pressure release (patient prone, therapist elbow into piriformis at posterior hip, sustained 90 sec). Stretch: figure-4 stretch. Activate: glute med clamshells immediately after. Note: never aggressive piriformis stretching if true piriformis syndrome without releasing first.",
      },
      {
        id:"nkt_hip_flex_fo", label:"Hip Extension Firing Order", muscle:"Glute max + Hamstrings + QL + Erectors",
        compensator:"N/A — tests firing sequence",
        how:"Patient prone. Both hands palpating: one on glute max, one on hamstring (or QL or erector). Ask for hip extension slowly from neutral. Count which fires first. Repeat 3 times for reliability. Normal sequence: Glute max fires first → ipsilateral hamstring → contralateral erector → ipsilateral erector. Any deviation = abnormal motor pattern. Also test in single-leg bridge: which fires to lift pelvis?",
        options:[
          { val:"Normal — Glute max fires first", color:"#00c97a", meaning:"Correct motor program. Gluteus maximus initiates hip extension before hamstrings or spinal extensors. MCC has correct motor sequence stored. Low injury risk for hamstrings and lumbar spine." },
          { val:"Abnormal — Hamstring fires first", color:"#ffb300", meaning:"Hamstring dominant hip extension. Glute max delayed or absent. Lumbar spine overloaded. Patient has hamstring strains and LBP. TREAT: release hamstrings → activate glute max → retrain hip extension pattern." },
          { val:"Abnormal — QL fires first", color:"#ff4d6d", meaning:"QL initiates — patient tilts pelvis to extend hip. No true hip extension occurring. Lumbar spine does the work. Chronic LBP pattern. TREAT: release QL → activate glute max → hip hinge retraining." },
          { val:"Abnormal — Erector spinae fires first", color:"#7f5af0", meaning:"Spinal extensors dominate. Patient uses lumbar extension to simulate hip extension. Severe glute and hamstring inhibition. Often seen in persistent LBP with spinal extension fear. TREAT: release erectors → activate TA + glute max simultaneously." },
        ],
        treatment:"Release: whichever muscle fired first (dominant compensator). Activate: glute max in prone isolation. Retrain: hip hinge pattern (Romanian deadlift) focusing on glute-driven extension. Home: glute max squeeze during every hip extension activity.",
      },
    ]
  },

  knee:{
    label:"Knee & Thigh", color:"#00c97a",
    intro:"Knee NKT focuses on the VMO vs VL relationship, hamstring-glute co-activation balance, and popliteus as a forgotten stabiliser. Common patterns: VMO inhibited → VL overactive → PFPS | hamstrings overactive (compensating for glute max) → posterior knee pain.",
    tests:[
      {
        id:"nkt_vmo", label:"Vastus Medialis Oblique (VMO)", muscle:"VMO",
        compensator:"When inhibited: VL (vastus lateralis) overactive → patellar maltracking",
        how:"Patient seated, knee at 30°. Palpate VMO (teardrop shape at medial lower thigh) and VL (lateral thigh) simultaneously. Ask patient to straighten knee slowly. Normal: VMO fires simultaneously or slightly before VL at final 30° of extension. POSITIVE INHIBITION: VL fires first and dominates throughout — VMO barely activates. Also test: terminal knee extension (TKE) — last 10° should activate VMO strongly. If VMO absent = inhibited.",
        options:[
          { val:"VMO facilitated — fires with VL", color:"#00c97a", meaning:"VMO activates with equal or slightly greater force than VL at terminal extension. Patella tracks medially within trochlear groove. No PFPS symptoms with squatting or stairs." },
          { val:"VMO inhibited — VL dominant", color:"#ffb300", meaning:"VL fires before and more strongly than VMO. Patella tracks laterally. Patient has anterior knee pain on stairs, squatting, sitting. IT band and lateral retinaculum tight. TREAT: release VL + IT band → activate VMO (terminal knee extension)." },
          { val:"VMO inhibited — post knee injury/surgery", color:"#ff4d6d", meaning:"VMO inhibited following ACL reconstruction, meniscectomy, or knee trauma. MCC switched off VMO as protective response. Patient has persistent quad weakness post-operatively despite exercise. NKT approach: release VL → activate VMO before quad sets." },
          { val:"VMO inhibited — hip weakness contributor", color:"#7f5af0", meaning:"VMO inhibited as part of valgus chain — glute med inhibited → knee valgus → VMO inhibited. Address glute med first, then VMO. Terminal knee extension + glute med activation simultaneously." },
        ],
        treatment:"Release: VL SMR (foam roll lateral thigh 90 sec) + IT band (roller lateral knee). Activate: terminal knee extension (TKE) with theraband, step-ups focusing on medial knee control. Home: TKE × 20 reps hourly, VMO squeeze at full extension.",
      },
      {
        id:"nkt_hamstrings", label:"Hamstrings", muscle:"Biceps femoris / Semimembranosus / Semitendinosus",
        compensator:"When overactive: compensating for inhibited glute max",
        how:"Patient prone. Test knee flexion resistance at 90°. Palpate hamstring belly. Overactive hamstrings: fire during activities they shouldn't (hip extension, standing). Test: prone hip extension — if hamstring fires before glute max = overactive compensator. Hamstring cramp during bridge = overactive (normal = glute does the work). Biceps femoris vs medial hamstring: test ER vs IR during knee flexion resistance.",
        options:[
          { val:"Normal — glute max dominant in extension", color:"#00c97a", meaning:"Hamstrings contribute to knee flexion appropriately. Do not dominate hip extension. Do not cramp during bridges. Glute max does the majority of hip extension work. No recurrent hamstring strains." },
          { val:"Overactive — glute max inhibition", color:"#ff4d6d", meaning:"Hamstrings overactive as hip extensors. Patient has recurrent hamstring strains (the compensator always gets injured, not the root cause). LBP. Hamstring 'tightness' that doesn't resolve with stretching (NKT rule: overactive muscles feel tight but aren't short). TREAT: release hamstrings → activate glute max." },
          { val:"Biceps femoris overactive — lateral chain", color:"#ffb300", meaning:"Biceps femoris specifically overactive. Lateral hamstring tightness. External rotation of tibia at knee. IT band and lateral knee pain. Often compensating for weak glute med. TREAT: release biceps femoris → activate glute med." },
          { val:"Medial hamstrings overactive — medial chain", color:"#7f5af0", meaning:"Medial hamstrings overactive. Internal tibial rotation. Compensating for inhibited adductors or popliteus. Medial knee pain. TREAT: release medial hamstrings → activate adductors or glute max." },
        ],
        treatment:"Release: foam roll hamstrings (posterior thigh, 90 sec). Stretch only AFTER NKT release (stretching alone won't fix overactive hamstrings). Activate: glute max exercises immediately. Home: glute-dominant bridge practice — feel the glute, not the hamstring.",
      },
      { id:"nkt_adductors", label:"Hip Adductors", muscle:"Adductor magnus / Longus / Brevis / Gracilis",
        compensator:"When overactive: compensating for inhibited glute max or medial hamstrings",
        how:"Patient sidelying (affected side up). Apply gentle resistance to hip adduction (push bottom leg up toward top). Palpate adductor group (medial thigh). POSITIVE OVERACTIVITY: adductors fire hard at rest or dominate hip extension. Test: supine — patient squeezes pillow between knees. If adductors cramp = overactive. Therapy localization: touch adductors → re-test glute max or medial hamstrings.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Adductors contribute to hip adduction and extension (adductor magnus) proportionally. Not dominant in hip extension. Not cramping at rest. Normal inner thigh tension." },
          { val:"Overactive — medial chain", color:"#ff4d6d", meaning:"Adductors overactive causing knee valgus tendency and medial tibial rotation. Medial knee pain. Groin strain risk. Often compensating for glute max. TREAT: release adductors → activate glute max + VMO." },
          { val:"Inhibited — lateral chain dominance", color:"#ffb300", meaning:"Adductors inhibited — TFL and IT band dominate lateral hip. Knee varus tendency. Poor sagittal plane hip control. Weakness in adduction particularly. TREAT: release TFL → activate adductors." },
        ],
        treatment:"Release: adductor SMR (foam roll inner thigh, 90 sec). Activate: glute max bridging with adductor squeeze. Home: side-lying adductor lifts × 15 reps, Copenhagen plank progression.",
      },
      { id:"nkt_tfl", label:"Tensor Fasciae Latae (TFL)", muscle:"Tensor fasciae latae",
        compensator:"When overactive: compensating for inhibited glute med or glute max",
        how:"Patient supine or sidelying. Palpate TFL (lateral hip, between anterior iliac crest and iliotibial band, distal to ASIS). Ask patient to flex, abduct, and IR the hip — TFL does all three. POSITIVE OVERACTIVITY: TFL fires during pure abduction (should be glute med) or is tender and firm at rest. Ober test: patient sidelying, test hip drops to table — cannot adduct past neutral = TFL/IT band tight. Therapy localization: touch TFL → re-test glute med. If glute med activates more = TFL compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"TFL assists hip flexion and IR proportionally. Not dominant in abduction (glute med does that). Ober test: hip adducts past neutral. No lateral hip pain at rest." },
          { val:"Overactive — glute med inhibition", color:"#ff4d6d", meaning:"TFL dominant in abduction. Flexes hip during intended abduction — patient rolls forward. IT band tight (Ober positive). Lateral hip and knee pain. TREAT: release TFL → activate glute med in slight extension (not flexion, prevents TFL re-domination)." },
          { val:"Overactive — IT band syndrome", color:"#ffb300", meaning:"TFL chronically overactive → IT band under chronic tension → iliotibial band syndrome. Lateral knee pain with running. Noble compression test positive. TREAT: TFL SMR + glute max and glute med activation." },
        ],
        treatment:"Release: TFL SMR (foam roll lateral hip between ASIS and greater trochanter, 90 sec). Activate: glute med in slight extension (clamshells). Never stretch TFL alone — activate glute med first. Home: lateral band walks.",
      },
      { id:"nkt_rectus_fem", label:"Rectus Femoris", muscle:"Rectus femoris",
        compensator:"When overactive: compensating for inhibited iliopsoas or VMO",
        how:"Patient prone. Knee flexion passive test: flex knee to end range — if pelvis anteriorly tilts (ASIS lifts) before reaching full knee flexion = rectus femoris overactive/shortened. Ely's test: patient prone, flex knee — if ipsilateral hip rises = RF shortened. Active test: seated — resist knee extension. RF fires powerfully. Compare to VL. Therapy localization: touch RF belly → re-test VMO.",
        options:[
          { val:"Normal length and tone", color:"#00c97a", meaning:"Knee can flex fully prone without pelvis rising. Ely's test negative. RF contributes to knee extension without dominating. Pelvis remains neutral during hip flexion." },
          { val:"Overactive — anterior pelvic tilt", color:"#ff4d6d", meaning:"RF shortened and overactive. Pulls ASIS forward, increasing anterior pelvic tilt. Ely's test positive. LCS pattern contributor. Patient has anterior knee pain and hip flexion tightness. TREAT: release RF → activate glute max + VMO." },
          { val:"Overactive — VMO inhibition", color:"#ffb300", meaning:"RF overactive and dominates terminal knee extension while VMO is inhibited. Patellar tracking laterally. PFPS pattern. TREAT: release RF → activate VMO (terminal knee extension)." },
        ],
        treatment:"Release: RF SMR (foam roll anterior thigh, 90 sec). Stretch: kneeling hip flexor with posterior pelvic tilt. Activate: VMO terminal knee extension immediately. Home: couch stretch × 2 min each side daily.",
      },
      { id:"nkt_popliteus", label:"Popliteus", muscle:"Popliteus",
        compensator:"When inhibited: LCL, posterior capsule overloaded; when overactive: lateral knee pain",
        how:"Patient prone, knee at 90°. Palpate popliteal fossa (posterior knee joint line, medial to biceps femoris). Apply gentle IR of tibia (internal rotation) at 90° flexion — popliteus unlocks knee (screw-home mechanism reversal). POSITIVE INHIBITION: lateral tibial rotation persists during knee flexion initiation (popliteus cannot unlock knee). Positive if posterior-lateral knee pain with resisted IR at 30° flexion. Therapy localization: touch lateral hamstrings → re-test popliteus IR.",
        options:[
          { val:"Normal — unlocks knee smoothly", color:"#00c97a", meaning:"Popliteus IR of tibia during knee flexion initiation smooth and painfree. No lateral knee pain. Normal knee unlocking pattern in gait." },
          { val:"Inhibited — lateral knee instability", color:"#ff4d6d", meaning:"Popliteus cannot IR tibia during knee flexion. Lateral knee instability, especially on rough terrain. 'Joint locking' sensation. TREAT: release biceps femoris → activate popliteus (gentle resisted IR at 30° knee flexion)." },
          { val:"Overactive — posterior-lateral knee pain", color:"#ffb300", meaning:"Popliteus tendinopathy. Pain at posterolateral knee especially downhill walking. Often compensating for LCL laxity or excessive external tibial rotation. Release popliteus → address tibial rotation pattern above." },
        ],
        treatment:"Release: popliteus pressure (posterior-lateral knee, gentle sustained 60 sec). Activate: resisted tibial IR at 30° knee flexion. Home: step-downs with medial knee control cue, lateral ankle stability training.",
      },
    ]
  },

  ankle:{
    label:"Ankle & Foot", color:"#ffb300",
    intro:"Ankle NKT identifies compensation between tibialis anterior/posterior and the peroneals, and the effect of limited dorsiflexion on the kinetic chain. Classic pattern: tibialis anterior inhibited → peroneals overactive → ankle instability. Tibialis posterior inhibited → peroneals + gastroc overactive → progressive flatfoot.",
    tests:[
      {
        id:"nkt_tib_ant", label:"Tibialis Anterior", muscle:"Tibialis anterior",
        compensator:"When inhibited: peroneals + EHL compensate for dorsiflexion",
        how:"Patient seated. Dorsiflex and invert foot against gentle resistance (this isolates tibialis anterior). Palpate belly (anterior shin). Normal: strong activation with dorsiflexion + inversion. POSITIVE INHIBITION: foot everts instead of inverting (peroneal compensation), or EHL fires to dorsiflex instead. Therapy localization: touch peroneus longus belly → re-test tibialis anterior. If stronger = peroneal compensating.",
        options:[
          { val:"Facilitated — normal", color:"#00c97a", meaning:"Tibialis anterior fires strongly during dorsiflexion + inversion. No compensation from peroneals. Ankle DF ROM normal. Foot clears during swing phase of gait without hip hiking." },
          { val:"Inhibited — peroneal dominant", color:"#ffb300", meaning:"Peroneus longus/brevis dominate dorsiflexion attempt — foot everts. Patient has ankle instability and recurrent inversion sprains (peroneals overloaded as compensators). TREAT: release peroneals → activate tib ant." },
          { val:"Inhibited — foot drop pattern", color:"#ff4d6d", meaning:"Severe tib ant inhibition — L4 nerve root or peroneal nerve involvement must be excluded. If neurological clear = MCC inhibition. Patient hikes hip to clear foot. TREAT: release peroneals → intensive tib ant activation with neuromuscular electrical stimulation if needed." },
          { val:"Inhibited — shin splint pattern", color:"#7f5af0", meaning:"Tib ant inhibited causing peroneals to overwork → medial tibial stress syndrome (shin splints). Pain along medial tibia. Patient cannot eccentrically control pronation. TREAT: release peroneals → activate tib ant eccentrically." },
        ],
        treatment:"Release: peroneal SMR (roller lateral lower leg from fibular head to ankle, 90 sec). Activate: seated tibialis anterior activation (dorsiflex + invert against theraband). Home: heel walks × 2 minutes daily.",
      },
      {
        id:"nkt_tib_post", label:"Tibialis Posterior", muscle:"Tibialis posterior",
        compensator:"When inhibited: peroneals overactive, foot pronates progressively",
        how:"Patient seated. Plantarflex and invert foot against resistance (plantar inversion isolates tib posterior). Palpate behind medial malleolus. POSITIVE INHIBITION: weak inversion in plantar flexion, or foot cannot resist eversion. Navicular drop test: mark navicular tuberosity in sitting, then standing — drop >10mm = tib post inhibition (arch collapse). Therapy localization: touch peroneals → re-test tib post.",
        options:[
          { val:"Normal — arch maintained", color:"#00c97a", meaning:"Tibialis posterior supports medial arch. Navicular drop <6mm. Strong plantar inversion resistance. No progressive flatfoot. Arch maintained in single-leg stance." },
          { val:"Inhibited — medial arch collapse", color:"#ffb300", meaning:"Tib post weakened. Medial arch collapses. Navicular drop 6–10mm. Early stage adult-acquired flatfoot. Pronation chain activates: tibial IR, knee valgus, anterior pelvic tilt. TREAT: release peroneals → activate tib post (heel raises in inversion)." },
          { val:"Inhibited — progressive flatfoot", color:"#ff4d6d", meaning:"Tib post significantly inhibited or partially ruptured. Navicular drop >10mm. 'Too many toes' sign (>2 toes visible behind heel from behind). Pain medial ankle. Refer for ultrasound/MRI. NKT: release peroneals → activate tib post + intrinsics." },
          { val:"Severely inhibited — tib post dysfunction", color:"#7f5af0", meaning:"Posterior tibial tendon dysfunction. Cannot perform single-leg heel raise. Progressive collapse of medial arch. Refer to orthopaedic/podiatry. Conservative: orthotics + aggressive tib post strengthening + peroneal release." },
        ],
        treatment:"Release: peroneal SMR + gastroc-soleus stretch. Activate: heel raises in slight inversion (on slightly inverted surface), towel scrunches, short foot exercise. Orthotics if severe. Home: short foot exercise × 20 reps, single-leg balance on slight inversion.",
      },
      {
        id:"nkt_gastroc", label:"Gastrocnemius / Soleus", muscle:"Gastroc-soleus complex",
        compensator:"When overactive: compensating for weak glutes or limited ankle DF; restricts kinetic chain",
        how:"Patient prone, knee extended. Test ankle dorsiflexion passively (normal: 20°). Limited DF = gastroc overactive or shortened. Weight-bearing lunge test: patient lunges with foot against wall — knee to wall distance (normal: 10cm from wall). <7cm = gastroc restriction. Test tightness: DF with knee extended (gastroc) vs knee bent (soleus). If DF better with knee bent = gastrocnemius tight. Therapy localization: touch gastroc → re-test tib ant. If better = gastroc compensating.",
        options:[
          { val:"Normal length and tone", color:"#00c97a", meaning:"Ankle DF normal (20°+). Lunge test: knee reaches wall at 10cm. No calf cramping during activity. Kinetic chain not restricted at ankle. Gastroc-soleus contribute to plantar flexion without restricting dorsiflexion." },
          { val:"Overactive — DF restriction", color:"#ffb300", meaning:"Gastroc overactive and shortened. Restricts ankle DF (<15°). Causes compensatory knee valgus, foot pronation, anterior pelvic tilt during squats. TREAT: gastroc SMR → ankle DF mobilisation → squat correction." },
          { val:"Overactive — glute compensation", color:"#ff4d6d", meaning:"Gastroc overactive as kinetic chain compensator for inhibited glutes. Patient pushes through calf during walking/running (calf dominance) rather than glute-driven propulsion. Calf strains common. TREAT: release gastroc → activate glute max." },
          { val:"Overactive — Achilles tendinopathy pattern", color:"#7f5af0", meaning:"Gastroc-soleus chronically overloaded. Tendon cannot tolerate load. Achilles tendinopathy developing or established. NKT: release peroneals + glute max activation (reduce calf load). Eccentric Achilles loading as adjunct." },
        ],
        treatment:"Release: gastroc SMR (foam roll calf from Achilles to popliteal crease, 90 sec). Stretch: straight-leg calf stretch 30 sec × 2. Activate: tib ant + tib post to balance. Home: wall lunge DF stretch × 3 daily, strengthening glutes to reduce calf overload.",
      },
      { id:"nkt_peroneals", label:"Peroneals (Peroneus Longus / Brevis)", muscle:"Peroneus longus / Peroneus brevis",
        compensator:"When overactive: compensating for inhibited tib anterior or tib posterior",
        how:"Patient seated. Evert foot against gentle resistance — peroneals activate. Palpate peroneal belly (lateral lower leg, posterior to fibula). POSITIVE OVERACTIVITY: peroneals fire during dorsiflexion attempt (should be tib ant), foot everts instead of dorsiflexing. Ankle instability with recurrent inversion sprains (peroneals overloaded). Test: therapy localization — touch peroneus longus → re-test tib ant or tib post. If either suddenly stronger = peroneals compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Peroneals activate for eversion and lateral ankle stability only. Do not dominate dorsiflexion. Ankle stable in single-leg stance. No recurrent inversion sprains." },
          { val:"Overactive — tib ant inhibition", color:"#ff4d6d", meaning:"Peroneals overactive compensating for inhibited tib ant. Foot everts during swing phase instead of dorsiflexing. Recurrent ankle sprains (overloaded peroneals fatigue). TREAT: release peroneals → activate tib ant." },
          { val:"Overactive — tib post inhibition", color:"#ffb300", meaning:"Peroneals overactive pulling foot into eversion as arch collapses. Progressive flatfoot. Navicular drop >10mm. Peroneal longus cannot control 1st ray plantar flexion. TREAT: release peroneals → activate tib post + intrinsics." },
        ],
        treatment:"Release: peroneal SMR (roller from fibular head to lateral malleolus, 90 sec). Activate: tib ant (heel walks) or tib post (inversion heel raises) immediately. Home: balance board training for proprioception.",
      },
      { id:"nkt_fhl", label:"Flexor Hallucis Longus (FHL)", muscle:"Flexor hallucis longus",
        compensator:"When inhibited: plantar fascia overloaded; when overactive: hallux impingement",
        how:"Patient supine. Resist great toe flexion (MTP and IP joints) while palpating posterior medial ankle (FHL tendon behind medial malleolus). Normal: strong great toe flexion (= 'toe-off' power). POSITIVE INHIBITION: great toe cannot flex against resistance, or medial arch collapses during single-leg stance. Test: single-leg heel rise — observe great toe grip. No grip = FHL inhibited. Therapy localization: touch FHL tendon → re-test arch stability.",
        options:[
          { val:"Normal", color:"#00c97a", meaning:"FHL strong in great toe flexion. Provides windlass mechanism tension during toe-off. Medial arch stable in single-leg stance. Normal push-off during gait." },
          { val:"Inhibited — plantar fascia overload", color:"#ff4d6d", meaning:"FHL inhibited — plantar fascia must provide all longitudinal arch tension. Plantar fasciitis develops. Hallux cannot grip during push-off. TREAT: release plantar fascia → activate FHL (towel scrunches, marble pick-ups)." },
          { val:"Overactive — posterior ankle impingement", color:"#ffb300", meaning:"FHL overactive and tight. Posterior ankle impingement (triggers at extreme plantar flexion or dorsiflexion). Dancer's/footballer's ankle. Tendon snaps medially. Release FHL tendon → joint mobilisation." },
        ],
        treatment:"Release: FHL SMR (gentle pressure behind medial malleolus, 60 sec). Activate: towel scrunches, marble pick-up, single-leg heel rise with great toe contact cue. Home: short foot exercise + great toe floor contact awareness.",
      },
      { id:"nkt_foot_intrinsics", label:"Foot Intrinsic Muscles", muscle:"Lumbricals / Interossei / Abductor hallucis",
        compensator:"When inhibited: plantar fascia and extrinsic toe flexors overloaded",
        how:"Patient seated or standing. Test: ask patient to perform 'short foot exercise' — shorten foot without curling toes (activate intrinsics only). Positive inhibition: patient curls toes (extrinsic flexors compensate) or cannot shorten foot at all. Observe navicular position — if drops >6mm in standing vs seated = intrinsics insufficient. Palpate abductor hallucis (medial arch) — should be palpable and firm in single-leg stance. Therapy localization: touch plantar fascia → re-test intrinsic activation.",
        options:[
          { val:"Normal — short foot achievable", color:"#00c97a", meaning:"Can perform short foot without toe curling. Abductor hallucis palpable and active. Navicular drop <6mm. Arch stable during single-leg stance. Normal toe splaying on ground contact." },
          { val:"Inhibited — arch collapse", color:"#ff4d6d", meaning:"Cannot perform short foot. Toes curl instead. Arch collapses in single-leg stance. Plantar fascia and extrinsic toe flexors overloaded. Pronation cascade up kinetic chain. TREAT: release plantar fascia → activate short foot + abductor hallucis." },
          { val:"Inhibited — bunion / hallux valgus", color:"#ffb300", meaning:"Abductor hallucis inhibited — hallux adducts toward 2nd toe. Bunion forming or established. Intrinsics too weak to maintain medial column alignment. Short foot exercise priority. Consider orthotic support." },
        ],
        treatment:"Release: plantar fascia SMR (golf ball roll under arch, 90 sec). Activate: short foot × 20 reps, abductor hallucis activation (spread toes, especially great toe medially). Home: barefoot training on varied surfaces × 15 min daily.",
      },
    ]
  },

  upper_limb:{
    label:"Elbow, Wrist & Hand", color:"#e879f9",
    intro:"Upper limb NKT identifies motor control dysfunction from elbow to hand. Common patterns: wrist extensor inhibition → wrist flexors overactive (lateral epicondylalgia), biceps overactive compensating for RC inhibition, grip weakness from cervical radiculopathy or motor control inhibition. Per NKT: the elbow and wrist are frequently affected by DISTANT inhibition (cervical, shoulder).",
    tests:[
      { id:"nkt_biceps", label:"Biceps Brachii", muscle:"Biceps brachii (long + short head)",
        compensator:"When overactive: compensating for inhibited RC (supraspinatus/subscapularis)",
        how:"Patient seated, elbow at 90°, forearm supinated. Resist elbow flexion. Palpate biceps belly. POSITIVE OVERACTIVITY: biceps fires powerfully and early in shoulder flexion (should not initiate shoulder movement). Humeral head translates anteriorly with shoulder flexion = biceps compensating for RC. Test: therapy localization — touch biceps → re-test supraspinatus or DNF. If either stronger = biceps compensating.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Biceps contributes to elbow flexion and forearm supination appropriately. Not dominant in shoulder flexion. No anterior shoulder pain on biceps loading." },
          { val:"Overactive — RC inhibition", color:"#ff4d6d", meaning:"Biceps overactive at shoulder, compensating for RC. Anterior shoulder pain especially on overhead activities. Bicipital groove tender. TREAT: release biceps (cross-fibre belly massage) → activate infraspinatus/supraspinatus." },
          { val:"Overactive — shoulder instability", color:"#ffb300", meaning:"Biceps long head overactive attempting to stabilise anterior glenohumeral joint. Usually post-instability or SLAP tear. Treat underlying instability and rotator cuff first." },
        ],
        treatment:"Release: biceps cross-fibre massage 60 sec. Supination stretch (hold elbow extended, pronate forearm gently). Activate: RC exercises (sidelying ER). Home: no aggressive biceps stretching without RC activation.",
      },
      { id:"nkt_triceps", label:"Triceps Brachii", muscle:"Triceps brachii (long / lateral / medial head)",
        compensator:"When inhibited: posterior deltoid and anconeus compensate",
        how:"Patient prone, elbow at 90°. Resist elbow extension (push forearm toward ceiling). Palpate triceps belly. POSITIVE INHIBITION: triceps weak and painless (C7 radiculopathy first); weak and painful (muscle lesion). Positive overactivity: triceps fires during elbow flexion attempts (rare — indicates neurological irritation). Therapy localization: touch posterior deltoid → re-test triceps. If triceps stronger = posterior deltoid compensating.",
        options:[
          { val:"Normal strength — C7 intact", color:"#00c97a", meaning:"Triceps extends elbow strongly against resistance. No C7 dermatomal changes. Normal push-up strength. Posterolateral elbow not painful." },
          { val:"Inhibited — C7 radiculopathy", color:"#ff4d6d", meaning:"Weak and painless triceps = C7 nerve root compression. Check C7 dermatome (middle finger), reflex (triceps jerk). Refer for MRI. Cervical neural mobilisation." },
          { val:"Inhibited — triceps tendinopathy", color:"#ffb300", meaning:"Strong and painful triceps = triceps tendinopathy at olecranon insertion. DTFM to tendon. Eccentric loading. Home: triceps eccentric press-ups." },
        ],
        treatment:"Inhibited (neurological): cervical neural mobilisation, MRI referral, nerve gliding. Inhibited (motor control): release posterior deltoid → activate triceps. Tendinopathy: DTFM, eccentric loading.",
      },
      { id:"nkt_wrist_ext", label:"Wrist Extensors (ECRB / ECRL)", muscle:"Extensor carpi radialis brevis / longus",
        compensator:"When inhibited: wrist flexors overactive — lateral epicondylalgia pattern",
        how:"Patient seated, elbow extended, forearm pronated. Resist wrist extension (dorsiflexion). Palpate ECRB (lateral epicondyle → 3rd metacarpal base). POSITIVE INHIBITION: weak wrist extension, lateral epicondyle tender. Overactivity: wrist extensors chronically tense (keyboard workers) — limit wrist flexion. Test: therapy localization — touch wrist flexors (FCR/FCU) → re-test wrist extensors.",
        options:[
          { val:"Normal strength", color:"#00c97a", meaning:"ECRB/ECRL extend wrist strongly against resistance. No lateral epicondyle pain. Normal grip strength. Full wrist flexion available passively." },
          { val:"Inhibited — lateral epicondylalgia", color:"#ff4d6d", meaning:"Wrist extensors inhibited and painful (lateral epicondylalgia). Wrist flexors overactive as compensators. TREAT: release FCR/FCU (wrist flexor SMR) → activate ECRB (eccentric wrist extension)." },
          { val:"Overactive — repetitive strain", color:"#ffb300", meaning:"Wrist extensors overactive and shortened from repetitive use (typing, gripping). Restrict wrist flexion. Lateral forearm tension. Release wrist extensors (forearm roller SMR) → activate wrist flexors." },
        ],
        treatment:"Release: wrist flexor SMR (forearm roller medial, 60 sec). Activate: eccentric wrist extension × 15 reps (Tyler twist). DTFM to lateral epicondyle if tender. Home: eccentric wrist extension daily.",
      },
      { id:"nkt_wrist_flex", label:"Wrist Flexors (FCR / FCU)", muscle:"Flexor carpi radialis / ulnaris",
        compensator:"When overactive: compensating for inhibited wrist extensors — medial epicondylalgia",
        how:"Patient seated, forearm supinated. Resist wrist flexion. Palpate FCR (medial forearm, between palmaris and pronator teres) and FCU (ulnar wrist). POSITIVE OVERACTIVITY: wrist flexors fire during gripping (expected) but also dominate wrist stabilisation when they should not. Medial epicondyle tender. Test: therapy localization — touch FCU → re-test FCR or ECRB.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Wrist flexors activate for grip and wrist flexion tasks. Not dominant in wrist extension tasks. No medial epicondyle pain at rest." },
          { val:"Overactive — medial epicondylalgia", color:"#ff4d6d", meaning:"Wrist flexors overactive and tender at medial epicondyle. Medial epicondylalgia. TREAT: release wrist flexors (SMR medial forearm) → activate wrist extensors." },
          { val:"Inhibited — grip weakness", color:"#ffb300", meaning:"Wrist flexors inhibited — grip significantly weak. Rule out C8/T1 radiculopathy, cubital tunnel, or carpal tunnel. NKT: release wrist extensors → activate wrist flexors." },
        ],
        treatment:"Release: forearm flexor SMR (medial forearm rolling, 60 sec). DTFM to medial epicondyle if golfer's elbow. Activate: eccentric wrist flexion. Home: forearm stretching + grip strengthening progression.",
      },
      { id:"nkt_pronator", label:"Pronator Teres / Quadratus", muscle:"Pronator teres / Pronator quadratus",
        compensator:"When overactive: restricts supination, compresses median nerve",
        how:"Patient seated, elbow at 90°. Apply resistance to pronation. Palpate pronator teres (medial elbow to mid-radius). POSITIVE OVERACTIVITY: pronator teres dominates and is tender on palpation at medial elbow. Limited passive supination. Median nerve compression symptoms (pronator syndrome). Test: therapy localization — touch pronator teres → re-test biceps supination strength.",
        options:[
          { val:"Normal tone", color:"#00c97a", meaning:"Pronation achieved without dominance. Supination full and painless. No median nerve symptoms with sustained forearm tasks." },
          { val:"Overactive — supination restriction", color:"#ff4d6d", meaning:"Pronator teres overactive. Limits supination → wrist extensors compensate → lateral epicondylalgia risk. Common in desk workers. TREAT: release pronator teres → activate supinator + biceps." },
          { val:"Overactive — pronator syndrome", color:"#ffb300", meaning:"Pronator teres compressing median nerve. Forearm aching + hand tingling (thumb, index, middle). Worsens with repetitive pronation. Differentiate from CTS: pronator syndrome worsens with pronation, not wrist flexion. Release + nerve gliding." },
        ],
        treatment:"Release: pronator teres cross-fibre massage at medial elbow 60 sec. Activate: supinator (resisted supination) and biceps immediately. Nerve gliding if compression symptoms. Home: forearm rotation mobility × 20 reps.",
      },
      { id:"nkt_grip", label:"Grip / Hand Intrinsics", muscle:"FDP / FDS / Lumbricals / Interossei",
        compensator:"When inhibited: extrinsic forearm flexors overactive — carpal tunnel risk",
        how:"Patient seated. Use hand dynamometer or clinician resistance for grip strength. Normal: dominant 35–45 kg, non-dominant 30–40 kg. Test intrinsics: ask patient to flex MCP joints while keeping IP joints extended (lumbrical action). If IPs flex instead = lumbricals inhibited, extrinsic flexors dominate. Therapy localization: touch forearm flexors (FDP/FDS) → re-test intrinsic grip.",
        options:[
          { val:"Normal grip strength", color:"#00c97a", meaning:"Normal grip for age/sex. Intrinsics and extrinsics balanced. No hand fatigue with sustained tasks. Normal MCP flexion with IP extension (lumbrical action)." },
          { val:"Inhibited — neurological cause", color:"#ff4d6d", meaning:"Grip weak + dermatomal changes. C8/T1 radiculopathy (ring + little finger weakness) or median nerve (thumb + index). Cubital tunnel or carpal tunnel. Neurological referral + neural mobilisation." },
          { val:"Inhibited — overuse inhibition", color:"#ffb300", meaning:"Grip weak without clear neurological cause. Often follows prolonged gripping tasks (climbers, manual workers). Extrinsic flexors overactive. TREAT: release forearm flexors → activate intrinsics (lumbrical isolation, putty exercises)." },
        ],
        treatment:"Release: forearm flexor SMR, wrist flexor stretch. Activate: intrinsic isolation exercises (lumbrical set, putty pinch). Neural mobilisation if carpal/cubital tunnel suspected. Home: grip strengthening with proper wrist alignment.",
      },
    ]
  },
};

// ── KC_REGIONS ──
const KC_REGIONS = {
  foot_ankle:{
    label:"Foot & Ankle", color:"#ffb300", role:"MOBILITY",
    intro:"The foot and ankle are the first MOBILE link of the lower kinetic chain. Their job is to absorb ground reaction forces and provide adequate dorsiflexion for squatting, running, and stair-climbing. When mobility is lost here, ALL joints above compensate — creating knee valgus, foot pronation, anterior pelvic tilt, and lumbar overload.",
    tests:[
      {
        id:"kc_ankle_df", label:"Weight-Bearing Dorsiflexion — Lunge Test",
        role:"MOBILITY TEST", joint:"Ankle (talocrural)",
        how:"Patient stands facing wall. Place foot 10cm from wall. Lunge knee toward wall keeping heel flat on floor. Measure knee-to-wall distance. If heel lifts before knee reaches wall = restricted. Normal: knee reaches wall at 10cm+ without heel rising. Also test in non-weight-bearing: patient supine, passively dorsiflex ankle — normal 20°+.",
        options:[
          { val:"Normal — ≥10cm / 20°+", color:"#00c97a", meaning:"Adequate dorsiflexion for all functional tasks. Kinetic chain above ankle is not restricted by DF limitation. No compensation patterns driven from ankle." },
          { val:"Mildly restricted — 7–9cm / 15–19°", color:"#ffb300", meaning:"Mild DF limitation. Patient compensates with slight foot pronation, tibial internal rotation, and mild knee valgus during squats/stairs. Gastroc-soleus mildly tight. Begin DF mobility work." },
          { val:"Moderately restricted — 4–6cm / 10–14°", color:"#ff6b35", meaning:"Moderate DF restriction. Significant compensation: foot hyperpronation, knee valgus, anterior pelvic tilt, and lumbar extension during squat. This is a primary driver of knee pain in runners/athletes. Gastroc, soleus, and posterior capsule restricted. Address immediately before lower limb loading." },
          { val:"Severely restricted — <4cm / <10°", color:"#ff4d6d", meaning:"Severe DF restriction. Patient cannot squat without major heel rise. Cannot walk up stairs without trunk compensation. Cascade of dysfunction through entire kinetic chain. May indicate posterior ankle impingement, OA, or old fracture. Talocrural joint mobilisation (Grade III–IV) + intensive soft tissue work essential." },
        ],
        treatment:"Mobilise: talocrural joint (posterior glide of talus, Grade III–IV). Soft tissue: gastroc SMR + soleus SMR + posterior capsule stretch. Exercise: wall lunge drill × 3 min daily, eccentric heel drops, single-leg squat with DF focus. Kinetic chain: once DF improved, reassess knee alignment and foot pronation — they should self-correct.",
        chainEffect:"Restricted ankle DF → heel rises early → foot pronates → tibia internally rotates → knee collapses into valgus → hip internally rotates → femur adducts → pelvis anteriorly tilts → lumbar extends. ONE restriction drives the entire chain.",
      },
      {
        id:"kc_subtalar", label:"Subtalar Joint Mobility — Inversion / Eversion",
        role:"MOBILITY TEST", joint:"Subtalar joint",
        how:"Patient prone or supine. Grasp calcaneus. Move calcaneus into inversion and eversion independently of talocrural joint. Normal: inversion 20°, eversion 10°. Compare sides. Also assess in weight-bearing: observe navicular drop (mark navicular sitting → standing; normal drop <6mm). Rigid subtalar = poor shock absorption. Hypermobile = excessive pronation.",
        options:[
          { val:"Normal — inversion 20° / eversion 10°", color:"#00c97a", meaning:"Subtalar joint mobile and stable. Normal shock absorption. Navicular drop <6mm. Arch height maintained in single-leg stance. No excessive pronation or supination during gait." },
          { val:"Hypomobile — rigid foot", color:"#ffb300", meaning:"Subtalar restricted in both planes. Rigid foot cannot absorb shock — loads transfer to Achilles, plantar fascia, and shin. Patient may have OA, tarsal coalition, or post-fracture stiffness. Poor shock absorption = stress injuries. Mobilise subtalar joint with inversion-eversion glides." },
          { val:"Hypermobile — excessive pronation", color:"#ff4d6d", meaning:"Subtalar excessively mobile — navicular drop >10mm. Medial arch collapses. Tibialis posterior failing to control pronation (inhibited per NKT). Pronation cascade drives tibial IR → knee valgus → hip IR. Strengthen tib posterior + arch intrinsics. Orthotics if severe." },
          { val:"Asymmetric — significant L vs R difference", color:"#7f5af0", meaning:"Side-to-side difference >5° = significant asymmetry in kinetic chain input. The more restricted side will drive ipsilateral compensations. The hypermobile side will drive contralateral trunk compensations. Address the restricted side first." },
        ],
        treatment:"Hypomobile: subtalar mobilisation (inversion-eversion glides, Grade III). Hypermobile: tibialis posterior + FHL + intrinsic foot muscle strengthening, short foot exercise. Orthotics: semi-rigid if navicular drop >10mm. Reassess tib post NKT — almost always inhibited in hypermobile foot.",
        chainEffect:"Rigid foot → poor shock absorption → Achilles overload, shin splints, plantar fasciitis. Hypermobile foot → tibial IR → knee valgus → hip adduction → SI joint asymmetry.",
      },
      {
        id:"kc_great_toe", label:"First MTP Extension — Hallux Mobility",
        role:"MOBILITY TEST", joint:"First MTP joint",
        how:"Patient seated or supine. Passively extend great toe at MTP joint. Normal: 60–70° extension. Test in weight-bearing: windlass test — patient stands on a step, extend great toe and observe arch rise. Also observe during gait push-off: does patient supinate foot to achieve toe-off or roll over lateral border? Restricted = hallux rigidus/limitus.",
        options:[
          { val:"Normal — 60–70° extension", color:"#00c97a", meaning:"Normal hallux dorsiflexion. Windlass mechanism functions — arch rises with toe extension. Patient can achieve full push-off during gait without compensation. No lateral border gait or external rotation of leg." },
          { val:"Mildly restricted — 40–59°", color:"#ffb300", meaning:"Mild hallux limitus. Patient early supinates foot during push-off (avoids hallux loading). Lateral metatarsal overload, peroneal pain, and Achilles overload may result. 1st MTP joint mobilisation required." },
          { val:"Moderately restricted — 20–39°", color:"#ff6b35", meaning:"Moderate hallux limitus. Patient cannot achieve heel-to-toe gait — abducts foot (toe-out gait), extends hip early, or flexes knee to compensate. Cascading: hip flexor overload, anterior knee pain. Bunion (hallux valgus) may be forming." },
          { val:"Severely restricted — <20° / hallux rigidus", color:"#ff4d6d", meaning:"Hallux rigidus. First MTP completely stiff. Patient walks on lateral foot border. Entire gait compensated. Refer for X-ray (OA/osteophytes). Surgical consultation if conservative fails. Conservative: MTP mobilisation, rocker-bottom shoe, sesamoid off-loading." },
        ],
        treatment:"Mobilise: 1st MTP dorsal glide (Grade III–IV). Soft tissue: plantar fascia release, sesamoid mobility. Gait retraining: heel-to-toe pattern with hallux loading. Toe separators at night. Orthotics: Morton's extension if arthritic.",
        chainEffect:"Restricted hallux → compensatory toe-out gait → tibial ER → knee valgus loss of protection → hip IR → LBP from asymmetric loading.",
      },
    ]
  },

  knee:{
    label:"Knee", color:"#ff4d6d", role:"STABILITY",
    intro:"The knee is a STABILITY joint — its job is to transmit force between the mobile ankle and mobile hip without excessive motion. Knee pain is almost always a symptom of failure elsewhere in the kinetic chain — usually restricted ankle dorsiflexion below or restricted hip mobility above. TREAT the cause, not the knee.",
    tests:[
      {
        id:"kc_knee_stability", label:"Knee Valgus Stress Test — Kinetic Chain",
        role:"STABILITY TEST", joint:"Knee",
        how:"Observe patient during: (1) Squat — does knee collapse medially? (2) Single-leg squat — does knee drop inward? (3) Step-down from 20cm box — medial knee drop? (4) Jump landing — bilateral or unilateral. Also: manually valgus stress at 0° and 30° to check MCL integrity separately. Observe: foot pronation, tibial IR, and hip adduction all occurring simultaneously = kinetic chain valgus (not structural).",
        options:[
          { val:"Stable — no valgus in any task", color:"#00c97a", meaning:"Knee maintains alignment through all functional tasks. Kinetic chain above (hip stability) and below (ankle DF, foot position) providing adequate support. No medial knee stress. MCL intact." },
          { val:"Dynamic valgus — functional tasks only", color:"#ffb300", meaning:"Knee collapses inward during squat or single-leg tasks but MCL is structurally intact. Kinetic chain failure: ankle DF limited + glute med inhibited driving valgus. This is the most common pattern in female ACL injuries. TREAT: ankle DF + glute med activation — do NOT focus on knee." },
          { val:"Valgus with hip drop — Trendelenburg pattern", color:"#ff6b35", meaning:"Knee valgus accompanied by contralateral pelvis drop (glute med weakness). Classic kinetic chain valgus from proximal instability. Patient cannot control single-leg stance. Medial compartment overloaded. Strengthen glute med → knee valgus will reduce." },
          { val:"Structural valgus — MCL laxity", color:"#ff4d6d", meaning:"Valgus present at rest and with valgus stress at 0° + 30°. MCL structurally lax. Medial compartment loaded asymmetrically. Refer if significant. NKT: assess VMO activation as it dynamically supports medial knee." },
        ],
        treatment:"Dynamic valgus: ankle DF mobilisation + glute med NKT programme + VMO activation. Jump landing retraining (soft knee, hip back). Structural MCL: bracing, progressive loading, VMO/hamstring strengthening. Kinetic chain correction: address ankle → hip → then knee-specific work.",
        chainEffect:"Restricted ankle DF (below) + inhibited glute med (above) = KNEE is squeezed into valgus by forces from both directions. Treating only the knee will fail.",
      },
      {
        id:"kc_patellar_mobility", label:"Patellar Mobility Test",
        role:"STABILITY TEST", joint:"Patellofemoral",
        how:"Patient supine, knee fully extended and relaxed. Grasp patella with thumb and index finger. Glide medially and laterally — normal: 1–2cm in each direction (approximately 1/4 patella width). Also tilt: lift medial edge of patella — lateral retinaculum tight if cannot lift ≥0°. Crepitus during passive patellar glide = PFPS or chondromalacia.",
        options:[
          { val:"Normal — symmetric glide, no crepitus", color:"#00c97a", meaning:"Patellar tracking within trochlear groove. Lateral retinaculum not restricting. No crepitus. Q-angle normal. VL/VMO balance adequate. No PFPS symptoms." },
          { val:"Laterally biased — tight lateral retinaculum", color:"#ffb300", meaning:"Patella glides less than 1cm medially. Lateral tilt test: cannot lift medial edge. Lateral retinaculum tight — often due to VL overactivity (NKT: VMO inhibited → VL overactive). Patient has PFPS with lateral knee ache, crepitus. TREAT: VL SMR + lateral retinaculum stretching + VMO activation." },
          { val:"Hypermobile — excessive lateral glide", color:"#ff4d6d", meaning:"Patella glides >2cm laterally with minimal resistance. Medial stabilisers (MPFL, VMO) insufficient. Risk of patellar subluxation or dislocation. Quad strengthening in safe range (0–30° for patellar stability), VMO focus, patellar taping." },
          { val:"Crepitus with glide", color:"#7f5af0", meaning:"Grinding/crepitus during patellar glide = cartilage change or chondromalacia patella. May be asymptomatic or painful. If painful and progressive — refer for imaging. Conservative: load management, VMO strengthening, step avoidance in acute phase." },
        ],
        treatment:"Lateral bias: VL foam roll + IT band SMR, lateral retinaculum stretch (McConnell tape medially), VMO terminal knee extension. Hypermobile: VMO strengthening (0–30°), MPFL-protecting brace. Kinetic chain: always address ankle DF and glute med before patellar taping.",
        chainEffect:"VMO inhibited (NKT) → VL overactive → patella laterally displaced → PFPS. ALSO: foot pronation → tibial IR → patella internally rotated → increased lateral patellar stress.",
      },
      {
        id:"kc_tibiofemoral_rot", label:"Tibial Rotation Assessment — Screw-Home Mechanism",
        role:"STABILITY TEST", joint:"Tibiofemoral",
        how:"Patient supine, knee at 90°. Assess passive tibial rotation: grasp foot, rotate tibia internally and externally. Normal: IR 20–30°, ER 30–40°. Assess screw-home: as knee moves from 90° to full extension, tibia should externally rotate automatically (screw-home mechanism locks knee). If not — popliteus may be inhibited. Also test standing: observe tibial rotation during single-leg squat.",
        options:[
          { val:"Normal — screw-home intact, symmetric rotation", color:"#00c97a", meaning:"Tibia normally externally rotates at terminal knee extension (screw-home mechanism). Popliteus and LCL functioning. Symmetric passive tibial rotation bilaterally. Knee locks appropriately in full extension for standing." },
          { val:"Restricted tibial IR — lateral chain tightness", color:"#ffb300", meaning:"Cannot internally rotate tibia adequately. Biceps femoris and IT band restricting IR. Patient toe-out during walking (externally rotated) to avoid tibial IR loading. Lateral knee pain. Release biceps femoris + IT band → improve tibial IR." },
          { val:"Excessive tibial IR — medial chain laxity", color:"#ff6b35", meaning:"Tibia falls into internal rotation easily. Medial structures (MCL, medial capsule) lax. Foot pronation driving tibial IR from below. Glute med weakness allowing hip IR from above. Medial knee overloaded. Strengthen: tib post, VMO, glute med." },
          { val:"Absent screw-home — popliteus dysfunction", color:"#ff4d6d", meaning:"Tibia does not externally rotate at terminal extension. Knee cannot fully lock in extension. Popliteus inhibited or over-lengthened. Patient stands with slight flexion (can't straighten fully). Unlock test positive. Treat popliteus: soft tissue + NKT activation." },
        ],
        treatment:"Restricted IR: biceps femoris + IT band SMR, tibial IR mobility drill. Absent screw-home: popliteus activation (resisted tibial IR at 30°), terminal knee extension focus. Always address kinetic chain: foot pronation → tibial IR → biceps femoris reactivity.",
        chainEffect:"Excessive tibial IR (from foot pronation) → medial knee overload → MCL stress → medial compartment OA risk. Restricted tibial ER → knee cannot lock → quadriceps must work harder → PFPS.",
      },
    ]
  },

  hip:{
    label:"Hip", color:"#00c97a", role:"MOBILITY",
    intro:"The hip is a MOBILITY joint — it needs adequate flexion, extension, internal rotation, external rotation, and abduction to transfer force between the lumbar spine and lower limb. Hip restriction is the MOST COMMON driver of lumbar spine pathology. Limited hip IR is the single most predictive finding for future LBP.",
    tests:[
      {
        id:"kc_hip_ir_mob", label:"Hip Internal Rotation Mobility",
        role:"MOBILITY TEST", joint:"Hip",
        how:"Patient prone, hips neutral, knees bent 90°. Allow both feet to fall outward (measuring hip IR). Normal: 40–45°. Also test: seated hip IR — patient seated on table, rotate lower leg outward (hip IR). Compare sides. Clinical significance: >18° side-to-side asymmetry = significant (GIRD equivalent at hip). Hip IR <35° = high LBP risk.",
        options:[
          { val:"Normal — 40–45° bilateral symmetric", color:"#00c97a", meaning:"Adequate hip IR for all functional tasks including running, cutting, squatting. Posterior hip capsule mobile. No compensation patterns driven by hip IR restriction. Lumbar spine not being forced to rotate to compensate." },
          { val:"Mildly restricted — 30–39°", color:"#ffb300", meaning:"Mild hip IR restriction. Patient compensates with increased lumbar rotation during activities requiring hip IR (e.g. walking, golf swing). Posterior capsule and external rotators (piriformis, gemellus) mildly tight. Begin posterior capsule stretching and hip ER SMR." },
          { val:"Moderately restricted — 20–29°", color:"#ff6b35", meaning:"Moderate hip IR restriction. Lumbar spine rotates excessively to compensate — LBP developing or established. Ipsilateral foot may toe-out during gait (compensatory ER to avoid IR demand). Hip impingement (FAI) or posterior capsule contracture. FADIR test likely positive." },
          { val:"Severely restricted — <20° or significant asymmetry", color:"#ff4d6d", meaning:"Severe hip IR restriction. Classic FAI or hip OA finding. Lumbar spine under enormous rotational stress. Patient cannot squat, run, or rotate without pain. FADIR and hip scour likely positive. Refer for X-ray/MRI. Aggressive hip mobility program + consider orthopaedic referral." },
        ],
        treatment:"Posterior capsule: 90-90 stretch, pigeon pose, hip IR in prone with passive pressure. Joint mobilisation: posterior hip glide (patient supine, therapist mobilises femoral head posteriorly). Soft tissue: piriformis + gemellus SMR + dry needling. NKT: piriformis release → glute med activation (piriformis often overactive when glute med inhibited).",
        chainEffect:"Restricted hip IR → lumbar spine rotates to compensate → asymmetric disc loading → LBP. Also: restricted hip IR → foot toes out during gait → medial knee stress.",
      },
      {
        id:"kc_hip_ext_mob", label:"Hip Extension Mobility — Thomas Test",
        role:"MOBILITY TEST", joint:"Hip",
        how:"Patient supine at edge of table. Bring BOTH knees to chest fully to flatten lumbar lordosis. Lower one leg — the other remains flexed to control pelvis. Observe lowering leg: (1) Hip extension: does thigh reach the table or hang above? Normal: thigh rests on or below horizontal. (2) Knee angle: does knee remain at 90° or extend? If knee extends = rectus femoris tightness. (3) Observe for tibial rotation or foot position changes.",
        options:[
          { val:"Negative — thigh to table, knee 90°", color:"#00c97a", meaning:"Full hip extension available. Iliopsoas and rectus femoris at normal length. No anterior hip capsule restriction. Pelvis can remain neutral during gait push-off phase. No anterior pelvic tilt driven by hip flexor tightness." },
          { val:"Positive — thigh elevated (iliopsoas short)", color:"#ffb300", meaning:"Thigh hangs above horizontal — iliopsoas tight/overactive. Forces anterior pelvic tilt. LCS pattern likely. Hip flexors shortened from sitting. During gait: hip cannot extend → trunk leans forward → LBP. TREAT: iliopsoas SMR + hip flexor stretching (couch stretch) + glute max activation." },
          { val:"Positive — knee extends (rectus femoris short)", color:"#ff6b35", meaning:"Knee extends (straightens) as thigh lowers — rectus femoris tight. Creates anterior pelvic tilt AND limits knee flexion simultaneously. Patient has PFPS, anterior knee pain, and anterior hip pain. Rectus femoris stretching (prone heel-to-glute) + SMR quads." },
          { val:"Positive — both hip and knee compensation", color:"#ff4d6d", meaning:"Both iliopsoas AND rectus femoris restricted. Thigh elevated AND knee extends. Severe anterior chain tightness. Patient in permanent LCS. Must address systematically: release both → activate glutes/hamstrings → retrain hip extension pattern." },
        ],
        treatment:"Iliopsoas: couch stretch, half-kneeling hip flexor stretch, iliopsoas SMR (careful — near neurovascular structures). Rectus femoris: prone heel-to-glute stretch, lying quad stretch. Activate: glute max after stretching. Gait retraining: push-off from hip not knee.",
        chainEffect:"Tight hip flexors → anterior pelvic tilt → increased lumbar lordosis → facet loading → LBP. Also: rectus femoris tight → knee cannot flex fully → altered squat mechanics.",
      },
      {
        id:"kc_hip_er_mob", label:"Hip External Rotation Mobility",
        role:"MOBILITY TEST", joint:"Hip",
        how:"Patient prone, knee bent 90°. Measure how far lower leg moves toward midline (hip ER). Normal: 40–45°. Also test in seated: patient seated, cross ankle over opposite knee (figure-4 position) and observe how far knee drops toward table. Compare sides. Note: piriformis becomes IR when hip flexed >60° — test position changes the muscle tested.",
        options:[
          { val:"Normal — 40–45° bilateral symmetric", color:"#00c97a", meaning:"Adequate hip ER for normal gait, sports, and hip dissociation. Deep gluteal muscles (piriformis, obturators, gemellus) at normal length. No lateral hip impingement. Figure-4 test: knee drops to table or near. SI joint not being stressed by ER restriction." },
          { val:"Restricted — tight external rotators", color:"#ffb300", meaning:"Hip ER < 35°. Deep external rotators tight — piriformis, obturators, quadratus femoris. Patient may have FABER test limitation. May restrict stride length during running. Prone figure-4 position limited. Stretch: lying figure-4, seated hip ER stretch." },
          { val:"Restricted + deep buttock pain (piriformis syndrome)", color:"#ff4d6d", meaning:"ER restricted with reproduction of deep gluteal pain or sciatic symptoms during ER test. Piriformis compressing sciatic nerve. FAIR test likely positive. NKT: piriformis overactive (compensating for inhibited glute med). TREAT: careful piriformis release → glute med activation." },
          { val:"Asymmetric — >15° side difference", color:"#7f5af0", meaning:"Significant asymmetry. The restricted side = more capsular loading on ipsilateral SI joint. Running creates rotational asymmetry. Asymmetric ER restriction often from single-side injury history or sport dominance (kicking leg, golf). Address restricted side first." },
        ],
        treatment:"Soft tissue: piriformis SMR, deep gluteal foam rolling, figure-4 stretch. Joint mobilisation: posterior hip capsule glide if capsular. NKT: piriformis release → glute med activation (inhibited glute med is usually driving piriformis overactivity). Hip ER stretching: seated, lying, pigeon pose.",
        chainEffect:"Restricted hip ER → compensatory lumbar rotation → asymmetric SI joint loading. During gait: hip cannot adequately ER → foot toes in → medial ankle stress.",
      },
      {
        id:"kc_hip_abd_mob", label:"Hip Abduction Mobility & Stability",
        role:"MOBILITY + STABILITY TEST", joint:"Hip",
        how:"MOBILITY: Patient sidelying, affected side up. Passively abduct hip — normal 45°. Also: Ober's test for IT band/TFL restriction (see TFL). STABILITY: Single-leg stance — Trendelenburg test. Patient stands on one leg 30 seconds. Positive = contralateral pelvis drops. Also: lateral step-down from 20cm box — observe hip drop and trunk lean. Functional: observe running gait for hip drop.",
        options:[
          { val:"Normal mobility and stability", color:"#00c97a", meaning:"Hip abducts to 45°. Trendelenburg negative. Single-leg squat: pelvis level, no hip drop. Running: symmetrical pelvis. Glute med functioning appropriately as primary lateral pelvic stabiliser." },
          { val:"Restricted mobility — TFL/IT band", color:"#ffb300", meaning:"Ober's test positive — hip cannot adduct past 10° = IT band/TFL restricting abduction. Patient has lateral hip/knee pain. TFL overactive (NKT: compensating for inhibited glute med). TREAT: TFL SMR → glute med activation." },
          { val:"Stability deficit — Trendelenburg positive", color:"#ff4d6d", meaning:"Pelvis drops contralaterally during single-leg stance. Glute med cannot support pelvis. Patient leans trunk over stance leg to reduce moment arm (gluteus medius lurch/Trendelenburg lurch). All single-leg activities overload medial structures below and lumbar above. NKT: confirm glute med inhibited → TFL/QL compensating." },
          { val:"Both mobility restricted AND stability deficit", color:"#7f5af0", meaning:"IT band tight + Trendelenburg positive. Classic kinetic chain hip failure. TFL and piriformis are both overactive, glute med severely inhibited. Lateral knee pain, hip pain, and lumbar dysfunction. Multi-session approach: release TFL + piriformis → activate glute med → functional hip loading." },
        ],
        treatment:"Restricted: TFL SMR + lateral hip stretch + IT band roller. Stability: NKT glute med protocol (release TFL → activate glute med: clamshells → lateral band walks → single-leg holds). Progress: step-ups, lateral lunges, single-leg squat with pelvis level focus. Running: cue hip level during gait.",
        chainEffect:"Glute med failure → pelvis drops → lumbar side-flexes → SI joint asymmetric load → LBP. Below: hip drop → tibial valgus stress → medial knee pain.",
      },
    ]
  },

  lumbar:{
    label:"Lumbar Spine", color:"#ff4d6d", role:"STABILITY",
    intro:"The lumbar spine is a STABILITY region — its role is to transmit force between the mobile thoracic spine above and mobile hips below, with minimal motion of its own. It has only 13° of rotation total. When the hips or thoracic spine lose mobility, the lumbar spine is forced into excessive motion → disc loading → LBP. Stability tests assess the deep stabilising system (TA, multifidus) and segmental control.",
    tests:[
      {
        id:"kc_lumbar_stability", label:"Lumbar Segmental Stability Tests",
        role:"STABILITY TEST", joint:"Lumbar spine",
        how:"1. PRONE INSTABILITY TEST: Patient prone, feet on floor. Therapist applies posterior-anterior pressure on spinous processes — note pain. Then patient lifts feet off floor (activates spinal stabilisers) — reapply PA pressure. POSITIVE = pain reduced when muscles activated = instability (not structural). 2. ACTIVE STRAIGHT LEG RAISE (ASLR): Supine. Ask patient to lift one leg 20cm without bending knee. Observe: does pelvis rotate? Does thorax rotate? Apply compression to ASIS (manual SIJ compression) — if ASLR improves = pelvic instability. Score 0–5 each side. 3. ABDOMINAL DRAWING-IN: Patient supine. Ask to draw navel in without holding breath — palpate TA 2cm medial to ASIS.",
        options:[
          { val:"Stable — all tests normal", color:"#00c97a", meaning:"Lumbar spine stable. TA activates independently before limb movement (normal feedforward). Prone instability test negative. ASLR performed without compensation. Multifidus palpable as local swelling with activation. Normal segmental control." },
          { val:"Prone instability positive — segmental instability", color:"#ffb300", meaning:"Pain on PA pressure that reduces when patient activates muscles (lifts feet) = segmental instability at that level. Most commonly L4/5 or L5/S1. Indicates deep stabiliser deficit at that segment. Address: specific TA + multifidus training at that segment." },
          { val:"ASLR positive — pelvic/SIJ instability", color:"#ff6b35", meaning:"ASLR difficult/painful. Compensatory rotation or pain. Improved with manual ASIS compression = SIJ force closure deficit. Pelvic floor + TA + gluteal activation pattern dysfunctional. Specific SIJ stabilisation program. Pelvic belt short-term if severe." },
          { val:"No TA activation — global instability", color:"#ff4d6d", meaning:"Patient cannot isolate TA. Draws in abdomen with whole breath hold or RA fires instead. Global spinal instability pattern — common in chronic LBP. Erector spinae and QL compensating for TA/multifidus inhibition. Begin specific TA retraining before ANY global strengthening." },
        ],
        treatment:"Specific stabilisation exercise (SSE): TA drawing-in (10 sec × 10 reps), progress to dead bug, bird-dog, single-leg bridge. Multifidus: prone swelling × 10 sec × 10 reps. Progress to functional: squat with belt/brace initially, wean as stabilisers develop. Address hips and thoracic mobility first.",
        chainEffect:"Lumbar instability → erector spinae + QL compensate → chronic LBP. Forces above (thoracic stiffness) and below (hip restriction) both increase lumbar instability demand.",
      },
      {
        id:"kc_lumbar_flexion_ctrl", label:"Lumbar Flexion Control — Waiter's Bow Test",
        role:"STABILITY TEST", joint:"Lumbar spine",
        how:"Patient standing. Ask to bow forward as if greeting someone — maintain lordosis while hinging forward at hips (hip hinge). Normal: lumbar maintains neutral curve while hips flex. ABNORMAL: lumbar flexes immediately and hips stay still (lumbar flexion dominant pattern). Also test: ask patient to touch toes — observe where movement occurs first. Place fingers on PSIS and ASIS — ASIS should move posteriorly as hip flexes.",
        options:[
          { val:"Normal — hip hinge dominant", color:"#00c97a", meaning:"Patient hinges from hip with lumbar maintained in neutral. PSIS moves as hips flex. Waiter's bow clean. Normal hip-dominant forward bending. Lumbar discs not excessively loaded during forward bending tasks. Correct deadlift/lifting mechanics." },
          { val:"Lumbar flexion dominant — mild", color:"#ffb300", meaning:"Lumbar flexes before or simultaneously with hip flexion. Mild pattern. Patient has increased disc loading with forward bending. Often has flexion-pattern LBP. Hip flexors and hamstrings may be tight (restricting hip hinge). Begin hip hinge retraining." },
          { val:"Lumbar flexion dominant — moderate/severe", color:"#ff4d6d", meaning:"Lumbar flexes immediately, hips barely move. Classic disc loading pattern. Patient experiences LBP with sitting, forward bending, picking up objects. Significant hamstring tightness or hip flexion restriction driving pattern. McKenzie extension may be direction of preference. Hip hinge retraining essential. Avoid lumbar flexion loading." },
          { val:"Aberrant movement — painful arc", color:"#7f5af0", meaning:"Patient deviates laterally (trunk shift) when bending forward — often reducing when returning to upright. Indicates lumbar disc herniation (shifts away from pain) or facet asymmetry. Kemp's test + SLR to differentiate. Address disc/facet before stability training." },
        ],
        treatment:"Hip hinge retraining: dowel rod along spine cue (3 contact points), Romanian deadlift with mirror, hip hinge with theraband. McKenzie if flexion-dominant LBP. Address hip hamstring tightness that forces lumbar to take the movement.",
        chainEffect:"Lumbar flexion dominant pattern → repeated disc loading → disc degeneration. Hip restriction CAUSES lumbar flexion pattern — address hip mobility to fix lumbar movement quality.",
      },
      {
        id:"kc_lumbar_rotation_ctrl", label:"Lumbar Rotation Control Test",
        role:"STABILITY TEST", joint:"Lumbar spine",
        how:"Patient seated on plinth, feet flat (removes hip/ankle from equation). Ask to rotate trunk left and right — observe where rotation occurs. Normal: majority of rotation from thoracic spine (45° each side). Lumbar contribution: <13° total. POSITIVE = lumbar rotates excessively and thoracic barely moves. Also: seated rotation with arms folded — compare to hands on head (adds thoracic load). Quadruped rotation test: on hands and knees, rotate trunk — lumbar should not flex/extend.",
        options:[
          { val:"Normal — thoracic dominant rotation", color:"#00c97a", meaning:"Thoracic spine contributes majority of rotation (>45° each side). Lumbar minimally rotates (<5° per side). Ribs and thoracic facets mobile. Thoracic rotation does not increase lumbar disc shear forces. Normal rotational mechanics for golf, tennis, running." },
          { val:"Thoracic stiff — lumbar compensating rotation", color:"#ffb300", meaning:"Thoracic rotation <30° and lumbar overrotates to compensate. Disc at L4/5 or L5/S1 subjected to rotational shear forces. LBP with rotation (golf swing, getting in/out of car). Thoracic mobilisation priority: rotational manipulation, foam roller rotation drill." },
          { val:"Bilateral thoracic stiffness — both sides", color:"#ff6b35", meaning:"Symmetric thoracic restriction — total rotation <60°. Often from prolonged desk posture, rib cage stiffness, or thoracic kyphosis. Lumbar maximally compensating bilaterally. Bilateral risk for disc pathology. Foam roller thoracic extension + rotation essential." },
          { val:"Asymmetric restriction — one side significantly less", color:"#ff4d6d", meaning:"More restricted on one side. Creates rotational asymmetry — lumbar rotation asymmetrically loaded. Common in golfers, throwers, racquet sport athletes. Address: unilateral thoracic rotation mobility (side-lying open book, seated rotation with dowel). NKT: check contralateral glute med and ipsilateral obliques." },
        ],
        treatment:"Thoracic: foam roller extension + rotation (30 reps daily), side-lying open book stretch, seated thoracic rotation with dowel. Manual therapy: thoracic rotation manipulation (high velocity). Lumbar control: seated rotation awareness training, quadruped anti-rotation.",
        chainEffect:"Stiff thoracic (above) forces lumbar to rotate → disc shear forces → LBP. Below: hip IR restriction also forces lumbar to compensate rotationally.",
      },
    ]
  },

  thoracic:{
    label:"Thoracic Spine", color:"#00e5ff", role:"MOBILITY",
    intro:"The thoracic spine is a MOBILITY region — it needs 45° of rotation each way and adequate extension to allow the shoulder and cervical spine to function properly. Thoracic stiffness is arguably the MOST OVERLOOKED cause of neck pain, shoulder impingement, and LBP. Mobilising the thoracic spine often immediately improves shoulder and cervical symptoms.",
    tests:[
      {
        id:"kc_thoracic_rotation", label:"Thoracic Rotation Mobility",
        role:"MOBILITY TEST", joint:"Thoracic spine",
        how:"Patient seated on chair (eliminates hip contribution). Ask to rotate trunk fully left and right — arms folded across chest. Normal: 45° each side (90° total). Goniometer: axis at top of head, stationary arm pointing forward, moving arm following nose direction. Also test: supine rotation test — patient supine, knees bent to 90°, drop both knees to one side (normal: legs rest on table). Compare sides.",
        options:[
          { val:"Normal — 45°+ bilateral, symmetric", color:"#00c97a", meaning:"Full thoracic rotation available. Normal T-spine mechanics. No forced lumbar compensation. Shoulder internal rotation and cervical rotation will both be adequate as thoracic is contributing its full share. No rib stiffness." },
          { val:"Mildly restricted — 35–44° one or both", color:"#ffb300", meaning:"Mild thoracic rotation restriction. Some lumbar compensation occurring. Patient notices stiffness getting in/out of car, looking over shoulder while driving. Early cervical and lumbar overload. Begin foam roller rotation + thoracic manipulation." },
          { val:"Moderately restricted — 25–34°", color:"#ff6b35", meaning:"Moderate restriction. Significant lumbar rotational compensation. Cervical spine also overloading to compensate. Shoulder impingement beginning (thoracic kyphosis increases with rotation restriction → shoulder impingement). Rib cage restriction palpable. Thoracic manipulation + rib mobilisation." },
          { val:"Severely restricted — <25° or asymmetric >15°", color:"#ff4d6d", meaning:"Severe thoracic restriction. Lumbar and cervical spine heavily overloaded. Shoulder impingement established. In athletes: high injury risk. Consider ankylosing spondylitis (bilateral symmetric restriction) or previous spinal fracture. Thoracic manipulation priority — often single greatest change in the assessment." },
        ],
        treatment:"Immediate: thoracic manipulation (HVLA rotation manipulation — often dramatically improves restriction). Daily: foam roller extension over rolled towel + seated rotation drill × 30 reps. Rib mobilisation: lateral rib glides. Soft tissue: thoracic erector + rhomboid SMR. Address cause: forward head posture, desk ergonomics.",
        chainEffect:"Stiff thoracic → lumbar overrotates (disc injury), cervical overworks (neck pain), shoulder internally rotates excessively (impingement). Improving thoracic rotation often immediately reduces shoulder and neck pain.",
      },
      {
        id:"kc_thoracic_extension", label:"Thoracic Extension Mobility",
        role:"MOBILITY TEST", joint:"Thoracic spine",
        how:"Patient supine. Place foam roller (or rolled towel) under thoracic spine at T4–T8. Ask patient to extend over roller with arms crossed or overhead. Observe: can thoracic spine extend over roller? Normal: vertebrae should extend over roller without significant resistance or pain. Also: wall angel test — patient stands with back to wall, feet 5cm from wall. Try to move arms from 90° to overhead maintaining contact with wall and lumbar neutral. Normal: arms reach overhead without losing wall contact.",
        options:[
          { val:"Normal — full extension, wall angel complete", color:"#00c97a", meaning:"Thoracic spine extends adequately. Wall angel: arms reach overhead while maintaining rib, lower back, and arm contact with wall. Normal posterior chain flexibility at thoracic level. Forward head and shoulder impingement not being driven by thoracic kyphosis." },
          { val:"Mildly restricted — some resistance over roller", color:"#ffb300", meaning:"Mild thoracic stiffness. Wall angel: arms cannot fully reach overhead without ribs lifting or lower back arching. Chronic desk posture beginning to restrict extension. Begin daily foam roller extension work — should not be painful, just stiff." },
          { val:"Moderately restricted — notable kyphosis fixation", color:"#ff6b35", meaning:"Thoracic kyphosis partially fixed. Foam roller: spine does not extend over roller — holds flat or reversal of curve. Wall angel: unable to maintain contact with wall past 120° shoulder elevation. Shoulder impingement very likely. Cervical spine hyperextending to compensate. Significant postural correction program needed." },
          { val:"Severely restricted — rigid thoracic kyphosis", color:"#ff4d6d", meaning:"Thoracic kyphosis rigidly fixed — cannot extend. May indicate Scheuermann's disease, severe disc degeneration, DISH (diffuse idiopathic skeletal hyperostosis), or osteoporotic compression fractures. Refer for imaging before aggressive manipulation. Conservative: gentle extension (prone on elbows progression) + respiratory physiotherapy." },
        ],
        treatment:"Foam roller: daily extension over T4–T8 level × 2 min. Stretch: thoracic extension with hands behind head. Wall angel: × 15 reps daily. Manual: thoracic extension HVLA manipulation (seated or prone). Breathing: rib cage expansion exercises. Correct driving/desk posture — lumbar roll support.",
        chainEffect:"Restricted thoracic extension → increased kyphosis → forward head → UCS pattern → cervical overload. Also: kyphosis → scapula protracts → impingement → rotator cuff injury.",
      },
      {
        id:"kc_rib_mobility", label:"Rib Cage Mobility Assessment",
        role:"MOBILITY TEST", joint:"Costovertebral / costotransverse joints",
        how:"Patient seated or supine. Place hands bilaterally on rib cage (thumbs at spine, fingers wrap laterally). Ask patient to breathe in deeply — observe symmetry of rib expansion. Normal: symmetric lateral expansion of lower ribs. Also: palpate individual rib angles (posterior, where rib meets transverse process) — press firmly and assess tenderness and stiffness bilaterally. Compare each level T3–T10. Spring test: HVLA-like PA pressure on rib angle — stiff = hypomobile rib.",
        options:[
          { val:"Normal — symmetric expansion, no rib tenderness", color:"#00c97a", meaning:"Bilateral symmetric rib cage expansion during breathing. No hypomobile ribs on palpation. Costotransverse joints mobile. Thoracic rotation and extension will be full. Breathing pattern diaphragmatic — ribs expanding laterally and posteriorly." },
          { val:"Asymmetric expansion — one side restricted", color:"#ffb300", meaning:"One side of rib cage expands less than other. Often ipsilateral to thoracic rotation restriction. Breathing may be thoracic (accessory muscle dominant). Ipsilateral rib articulations hypomobile. Rib mobilisation (unilateral anterior-posterior rib pressure or manipulation) at restricted level." },
          { val:"Hypomobile ribs — specific levels tender", color:"#ff6b35", meaning:"Specific rib angles tender and stiff on PA pressure. Hypomobile costovertebral/costotransverse joints. Restricts thoracic rotation at that spinal level. Often follows respiratory illness, thoracic trauma, or prolonged poor posture. Manipulate/mobilise specific ribs at stiff levels." },
          { val:"Upper chest breathing — diaphragm inhibited", color:"#ff4d6d", meaning:"Rib cage rises vertically (upper chest breathing) rather than expanding laterally — diaphragm inhibited (see NKT diaphragm). Scalenes and SCM overactive as primary breathers. Lower ribs do not expand. Retrain: 360° diaphragmatic breathing, crocodile breathing, lateral rib expansion. Treat NKT: scalene release → diaphragm activation." },
        ],
        treatment:"Rib mobilisation: Grade III–IV PA pressure on hypomobile rib angles. HVLA: rib manipulation in prone. Breathing: lateral rib expansion training (patient places hands on lower ribs, breathe into hands). Soft tissue: intercostal release. NKT: scalene + SCM release → diaphragm activation if breathing pattern disordered.",
        chainEffect:"Hypomobile ribs → restrict thoracic rotation → lumbar overrotation → LBP. Also: restricted breathing pattern → reduced core stability (diaphragm is a core stabiliser) → LBP.",
      },
    ]
  },

  scapula:{
    label:"Scapula & Shoulder", color:"#7f5af0", role:"STABILITY → MOBILITY",
    intro:"The scapula is a STABILITY region — it must be stable enough to serve as a platform for the mobile glenohumeral joint above. The glenohumeral joint is MOBILE. Poor scapular stability (serratus anterior + lower trap inhibition) forces the mobile GH joint to compensate with impingement patterns. Scapulohumeral rhythm must be normal for pain-free overhead activity.",
    tests:[
      {
        id:"kc_scapulohumeral_rhythm", label:"Scapulohumeral Rhythm Assessment",
        role:"STABILITY TEST", joint:"Scapula / GH joint",
        how:"Patient seated or standing. Observe arm elevation in scapular plane (between flexion and abduction). Normal ratio: for every 2° of GH elevation, 1° of scapular upward rotation = 2:1 ratio (total: 120° GH + 60° scapular = 180° total). Observe: (1) Early scapular elevation (shrugging) = upper trap dominant. (2) Winging at any point = serratus inhibited. (3) Painful arc (60–120°) = impingement. (4) Does scapula upwardly rotate or just elevate? Mark inferior angle and medial border with marker for precision.",
        options:[
          { val:"Normal — 2:1 ratio, no shrug, no winging", color:"#00c97a", meaning:"Scapula upwardly rotates smoothly in 2:1 ratio with GH elevation. No early shrugging. No winging. Painful arc absent. Lower trap, serratus, and upper trap balanced. Normal force couple functioning. Overhead activity pain-free." },
          { val:"Upper trap dominant — early shoulder elevation", color:"#ffb300", meaning:"Shoulder elevates immediately with arm raising (upper trap fires first — NKT: lower trap inhibited). Ratio disrupted — too much scapular elevation, not enough upward rotation. Patient feels tightness across top of shoulder. Impingement risk. TREAT: upper trap release → lower trap activation → retrain arm elevation pattern." },
          { val:"Serratus deficit — medial winging", color:"#ff6b35", meaning:"Medial border of scapula wings away from thorax during arm elevation. Serratus anterior inhibited (cannot protract/upwardly rotate scapula — NKT: pec minor overactive). Subacromial space decreases → impingement. Full overhead elevation impossible without winging. TREAT: pec minor release → serratus activation." },
          { val:"Combined pattern — both elevation and winging", color:"#ff4d6d", meaning:"Upper trap dominance + serratus inhibition simultaneously. Severe scapular dyskinesis. Multiple muscles dysfunctional. Patient has established shoulder impingement and possible rotator cuff pathology. Multi-system treatment: release upper trap + pec minor → activate lower trap + serratus → retrain arm elevation." },
        ],
        treatment:"Scapular muscle rebalancing: lower trap (prone Y) + serratus (push-up plus, serratus punch). Release: upper trap SMR + pec minor soft tissue. Movement retraining: wall slide with scapular depression cue, elevation drills with resistance band. Avoid overhead loading until rhythm normalised.",
        chainEffect:"Poor scapular stability → subacromial space narrowing → impingement → rotator cuff tendinopathy → tear. Also: scapular winging → GH joint forced into excessive IR → anterior capsule stress.",
      },
      {
        id:"kc_gh_ir_mob", label:"Glenohumeral Internal Rotation — GIRD Assessment",
        role:"MOBILITY TEST", joint:"Glenohumeral joint",
        how:"Patient supine, shoulder at 90° abduction, elbow at 90°. Stabilise scapula (prevent posterior tipping — place hand under scapular spine). Passively internally rotate: forearm drops toward table. Normal: 60–70°. Compare bilaterally. GIRD (Glenohumeral IR Deficit): >18° side-to-side difference is clinically significant in throwing athletes. Also: total arc of rotation (ER + IR combined) should be similar bilaterally. Loss of total arc = true capsular restriction.",
        options:[
          { val:"Normal — 60–70° bilateral, <18° asymmetry", color:"#00c97a", meaning:"Adequate GH internal rotation. Posterior capsule mobile. Total arc of rotation symmetric. No posterior impingement. Rotator cuff in normal length-tension relationship. No GIRD pattern. Overhead activities unrestricted." },
          { val:"GIRD — >18° side difference (throwers)", color:"#ffb300", meaning:"Significant GIRD in dominant arm of throwing athletes. Posterior capsule contracted from repetitive overhead loading. GIRD shifts GH contact point posterosuperiorly — posterior cuff and labrum at risk. Loss of total arc indicates capsular restriction (not just bony adaptation). Sleeper stretch + posterior capsule mobilisation essential." },
          { val:"Bilateral restriction — posterior capsule tightness", color:"#ff6b35", meaning:"Both shoulders show restricted IR. Non-throwing athlete — indicates global posterior capsule contracture or UCS-related tightness. Pec minor tightness also limiting IR (anterior chain restrictors). Posterior capsule stretching bilaterally + pec minor release." },
          { val:"Severely restricted — frozen shoulder pattern", color:"#ff4d6d", meaning:"IR severely restricted (<30°). All planes restricted (capsular pattern: ER > Abd > IR). Adhesive capsulitis likely. Pain at end-range passive motion. Refer for corticosteroid injection assessment. Grade III–IV GH mobilisation (inferior glide, posterior glide). Night pain = inflammatory phase — not mobilised aggressively." },
        ],
        treatment:"GIRD: sleeper stretch × 3 × 30 sec daily, posterior capsule joint mobilisation (posterior glide). Frozen shoulder: Maitland Grade I–II in pain → Grade III–IV in stiff phase. End-range stretching program. Joint distension injection if severe. NKT: RC activation after each mobilisation session.",
        chainEffect:"GH IR restriction → shoulder impingement (posterior capsule pushes humeral head anterosuperiorly → compresses supraspinatus). Also: GH IR loss → thoracic rotation compensates → lumbar overloads.",
      },
      {
        id:"kc_cervical_thoracic_jct", label:"Cervicothoracic Junction (C7–T4) Mobility",
        role:"MOBILITY TEST", joint:"Cervicothoracic junction",
        how:"Patient seated. Assess rotation at cervicothoracic junction specifically: ask patient to rotate head fully. Apply resistance to C2 level (fixes upper cervical) and ask for rotation — measures mid-cervical rotation. Then fix C6 and ask to rotate — measures lower cervical and CT junction rotation. Palpation: PA pressure on C7, T1, T2, T3 spinous processes — stiffness and tenderness indicates hypomobility at CT junction. Normal: T1 should be mobile — spring test should have spring, not 'wooden' feel.",
        options:[
          { val:"Normal — mobile CT junction", color:"#00c97a", meaning:"CT junction mobile on PA spring test. No significant stiffness at T1–T3. Cervical rotation flows smoothly through CT junction. Brachial plexus exits freely. No referred arm symptoms provoked by CT junction loading." },
          { val:"Hypomobile CT junction — restricted rotation", color:"#ffb300", meaning:"CT junction stiff — PA spring test feels wooden at T1–T3. Reduced cervical rotation, particularly at lower levels. Patient has stiffness at base of neck. Often from forward head posture (chin poke — the CT junction extends to compensate for FHP). Mobilise: PA and rotation mobilisations at C7–T3." },
          { val:"CT junction hypomobility with arm symptoms", color:"#ff4d6d", meaning:"CT junction restricted AND provokes arm tingling/heaviness with loading. Brachial plexus or first rib elevated at CT junction. First rib elevation test: compare first rib height bilaterally (should be level). Thoracic outlet symptoms. Mobilise CT junction + first rib mobilisation. Scalene release (NKT: scalenes often overactive due to diaphragm inhibition — elevating first rib)." },
          { val:"Cervicothoracic instability — excessive motion", color:"#7f5af0", meaning:"Hypermobile CT junction — too much motion (often post-whiplash). PA spring has no resistance at C7/T1. May be causing positional headaches and neurological symptoms. Stabilise: deep cervical flexor activation, cervicothoracic stabilisation exercises. Avoid aggressive mobilisation or manipulation at this level." },
        ],
        treatment:"Hypomobile: PA mobilisation at T1–T3 (Maitland Grade III–IV), rotation mobilisation in sitting. First rib: inferior-posterior first rib mobilisation. Soft tissue: levator scapulae + upper trap at CT junction. Postural correction: CT junction extension exercises.",
        chainEffect:"Stiff CT junction → cervical spine compensates with excess rotation → cervicogenic headache. Also: CT junction stiffness → brachial plexus tension → arm symptoms. Shoulder function also affected (T1 sympathetics to upper limb exit here).",
      },
    ]
  },

  cervical:{
    label:"Cervical Spine", color:"#ff6b35", role:"MOBILITY",
    intro:"The cervical spine is a MOBILITY region — it needs 80° of rotation, 80° flexion, 70° extension, and 45° side-flexion for normal function. The upper cervical spine (C0–C2) provides 50% of all cervical rotation. The lower cervical (C3–C7) is primarily flexion/extension. Cervical dysfunction is almost always secondary to thoracic stiffness below and postural control deficit from DNF inhibition.",
    tests:[
      {
        id:"kc_cervical_rot_mob", label:"Cervical Rotation Mobility",
        role:"MOBILITY TEST", joint:"Cervical spine",
        how:"Patient seated, shoulders level. Rotate head fully left and right. Normal: 80° each side. Measure with goniometer (stationary arm top of head, moving arm follows nose). Differentiating upper vs lower cervical contribution: Flexion-Rotation Test (FRT) for C1/C2 specifically — patient fully flexes cervical spine (chin to chest), then rotates maximally. Normal FRT: 40–45° each side. <32° = positive = C1/C2 hypomobility. This eliminates contribution from lower cervical.",
        options:[
          { val:"Normal — 80° bilateral, FRT 40°+ each side", color:"#00c97a", meaning:"Full cervical rotation from both upper (C1/C2) and lower (C3–C7) cervical spine. No restriction. Normal driving vision, sport rotation, and head turning. Cervical facet joints and disc all contributing appropriately. No cervicogenic headache from rotation restriction." },
          { val:"Restricted — C1/C2 dominant (FRT positive)", color:"#ffb300", meaning:"Total rotation restricted and FRT <32° = upper cervical (C1/C2) restriction. Most common cause of cervicogenic headache and unilateral base-of-skull pain. Suboccipital muscles overactive. Upper cervical mobilisation (C1/C2 rotation and side-flex) + suboccipital release are treatment." },
          { val:"Restricted — lower cervical dominant", color:"#ff6b35", meaning:"Total rotation restricted but FRT normal = lower cervical (C3–C7) restriction. Facet joint or disc-related. Cervical rotation mobilisation at specific levels. Often related to thoracic stiffness causing lower cervical overload. Treat thoracic first, reassess." },
          { val:"Severely restricted bilateral — consider serious pathology", color:"#ff4d6d", meaning:"Both rotations severely restricted (especially if recent onset, no mechanism, or in older patient). Consider: RA (atlantoaxial instability — Sharp-Purser test FIRST), cervical myelopathy (Babinski/reflexes), infection, tumour. Urgent imaging if no mechanism. Do NOT manipulate until serious pathology ruled out." },
        ],
        treatment:"C1/C2: specific C1/C2 rotation manipulation or HVT (cervicogenic headache protocol). Suboccipital release + DNF activation. Lower cervical: segmental mobilisation at restricted level. Thoracic: always treat thoracic rotation restriction first as it directly improves cervical rotation. Home: cervical rotation active ROM × 10 reps each side daily.",
        chainEffect:"Restricted cervical rotation → patient rotates thoracic more → thoracic overload. Restricted cervical → SCM overworks → cervicogenic headache. DNF inhibition (NKT) is root cause in most cases.",
      },
      {
        id:"kc_cervical_flex_ext", label:"Cervical Flexion / Extension Mobility",
        role:"MOBILITY TEST", joint:"Cervical spine",
        how:"Patient seated. Flexion: chin-to-chest — normal = chin touches chest or ~80°. Extension: look to ceiling — normal = 70°. Measure with goniometer or inclinometer. Chin-to-chest test: failure to achieve = upper cervical restriction OR DNF weakness. Chin poke during extension (lower cervical extends, upper cervical flexes simultaneously) = forward head posture compensation. Observe quality: is movement smooth or jerky? Stiff segments produce jerky motion.",
        options:[
          { val:"Full range, smooth — flexion 80°, extension 70°", color:"#00c97a", meaning:"Full cervical flexion and extension. All segments contributing. Smooth arc of movement without jerky steps. DNF able to guide flexion without chin poke. No segment-specific stiffness. Normal disc and facet joint mechanics." },
          { val:"Flexion restricted — upper cervical or DNF weakness", color:"#ffb300", meaning:"Cannot flex fully (chin more than 2 finger-widths from chest). May be upper cervical (C0–C2) capsule restriction OR DNF too weak to guide forward head in flexion. Patient uses chin poke to start flexion. Assess DNF (CCFT) — if weak, activate. If joint restricted, mobilise. Distinguish by palpating joints during motion." },
          { val:"Extension restricted — disc or osteophyte", color:"#ff6b35", meaning:"Extension limited and painful. Pain at end-range extension suggests facet loading or posterior disc bulge. Pain arm with extension = foraminal compression (Spurling's context). Avoid aggressive extension mobilisation if radicular symptoms. Maitland Grade I–II first, reassess neurological status." },
          { val:"Chin poke pattern — forward head compensation", color:"#7f5af0", meaning:"During extension, chin pokes forward (upper cervical hyperextends, lower cervical fails to extend). Classic forward head posture. DNF inhibited. CT junction hypomobile. Patient cannot extend through lower cervical. Treat: CT junction mobilisation + DNF activation + thoracic extension." },
        ],
        treatment:"Restricted flexion: upper cervical mobilisation (C0–C2), DNF activation. Restricted extension: lower cervical extension mobilisation (Grade II–III initially), thoracic extension work. Chin poke: CT junction extension mobilisation + DNF programme. Home: segmental cervical self-mobilisation, chin tuck exercise.",
        chainEffect:"Restricted cervical extension → head cannot extend → thoracic must compensate → kyphosis. Restricted flexion + DNF weakness → cervicogenic headache, dizziness.",
      },
    ]
  },
};

// ── MOVEMENTS ──
const MOVEMENTS = {
  squat:{
    label:"Bilateral Squat", icon:"🏋️",
    description:"Bilateral weightbearing — tests global lower limb and core mechanics. Most comprehensive lower body screen.",
    howToObserve:"Patient performs 3 bodyweight squats to comfortable depth. Observe from anterior (knee alignment, trunk), lateral (trunk lean, heel rise, pelvic tilt), and posterior (pelvic drop, foot pronation). Ask patient to go as deep as comfortable. Repeat in slow motion.",
    checklistKeys:["knee_valgus","knee_varus","heel_rise","anterior_pelvic_tilt","posterior_pelvic_tilt","trunk_lean_forward","foot_pronation","foot_supination","limited_depth","lumbar_flexion_comp","lumbar_extension_comp","pain_avoidance","asymmetric_loading"],
  },
  gait:{
    label:"Gait Analysis", icon:"🚶",
    description:"Walking pattern — reveals chronic compensation patterns. Observe at normal walking speed. 10+ steps each way.",
    howToObserve:"Observe from posterior (pelvic drop, trunk lean, foot pronation), anterior (knee alignment, arm swing), and lateral (trunk lean, heel strike, push-off pattern). Ask patient to walk 10m away and 10m back at natural pace. Observe 3 cycles each view.",
    checklistKeys:["pelvic_drop","foot_pronation","trunk_lean_lateral","asymmetric_loading","pain_avoidance","instability","knee_valgus"],
  },
  single_leg:{
    label:"Single Leg Stance", icon:"🦶",
    description:"Highest demand test for lumbopelvic and lower limb stability. Reveals deficits not seen in bilateral tasks.",
    howToObserve:"Patient stands on one leg with contralateral knee raised to 90° hip flexion. Hold 30 seconds each side. Observe: pelvic level, trunk position, knee alignment, foot arch, wobbling. Compare sides. Eyes open first, then closed.",
    checklistKeys:["pelvic_drop","knee_valgus","instability","trunk_lean_lateral","foot_pronation","pain_avoidance"],
  },
  lunge:{
    label:"Forward Lunge", icon:"🤸",
    description:"Split stance — tests asymmetric loading, hip mobility, and frontal plane control. Step forward 2–3 feet.",
    howToObserve:"Patient performs 3 forward lunges each side. Observe from anterior (knee alignment, pelvic level), lateral (trunk position, heel rise, lumbar), and posterior (foot position, pelvic drop). Compare left vs right sides.",
    checklistKeys:["knee_valgus","trunk_lean_forward","heel_rise","lumbar_extension_comp","lumbar_flexion_comp","anterior_pelvic_tilt","pelvic_drop","asymmetric_loading","pain_avoidance"],
  },
  overhead:{
    label:"Overhead Reach", icon:"🙌",
    description:"Tests integrated shoulder, thoracic, and cervical mechanics. Both arms simultaneously overhead.",
    howToObserve:"Patient reaches both arms straight overhead against a wall. Observe from anterior (arm symmetry, shoulder elevation, trunk lean) and lateral (thoracic extension, head position, lumbar arch). Also observe arm elevation from side — when does scapula start rotating?",
    checklistKeys:["limited_depth","shoulder_elevation","scapular_winging","forward_head","lumbar_extension_comp","trunk_lean_forward","asymmetric_loading","pain_avoidance"],
  },
  bend:{
    label:"Forward Bending", icon:"🙇",
    description:"Standing forward bend — tests hip hinge pattern, SBL chain, and neural tension. Critical for LBP assessment.",
    howToObserve:"Patient bends forward reaching hands toward floor. Observe from lateral (where does motion initiate — hip or lumbar?), posterior (trunk shift left/right, spinal curvature), and at end range. Observe motion returning to upright — any reversal of lurch?",
    checklistKeys:["lumbar_flexion_comp","trunk_shift","foot_pronation","pain_avoidance","knee_valgus","limited_depth"],
  },
};

// ── FMS_DB ──
const FMS_DB = {
  sq:{
    label:"Deep Squat", icon:"🏋️",
    how:"Stand feet shoulder-width, toes slightly out 5-10°. Hold dowel overhead wide grip, arms fully extended. Descend as deep as possible, heels flat. Observe from anterior AND lateral.",
    cues:["Heels completely flat on floor throughout","Arms fully extended overhead — no elbow bend","Knees track over 2nd toe","Lumbar spine neutral throughout","Head neutral — no forward jut","Feet symmetrical"],
    scoring:"3=Full depth, torso parallel/vertical to tibia, knees over toes, dowel overhead. 2=Heel rise OR arm drop OR compensatory lean. 1=Unable to achieve depth even with heel lift. 0=Pain.",
    defects:{
      knee_valgus:{
        label:"Bilateral Knee Valgus",
        meaning:"Both knees collapse medially — cardinal sign of hip abductor and external rotator weakness combined with adductor dominance.",
        biomech:"Insufficient gluteus medius and deep ER torque allows adductors to pull femur into IR and adduction. Tibial IR follows, creating medial patellar stress and ACL loading.",
        weak:["Gluteus medius (primary)","Gluteus maximus (ER component)","Piriformis","Obturator internus/externus","VMO","Posterior tibialis"],
        tight:["Hip adductors (longus, brevis, magnus)","TFL","Lateral hamstring","IT band"],
        kinetic:"Foot pronation → tibial IR → femoral IR/adduction → medial patellar maltracking → hip impingement. Complete lower chain failure.",
        type:"Stability + Motor Control",
        risk:"Patellofemoral pain, ACL tear, medial meniscus stress, IT band syndrome, hip labral irritation.",
        compensation:"Adductor group dominates due to delayed glute activation — collapses medially to find wider BoS.",
        treatment:["Inhibit: SMR adductors + TFL 90s/spot","Lengthen: adductor long-sit stretch 3×45s, couch stretch","Activate: clamshell 3×20, side-lying abduction 3×15","Integrate: lateral band walk, sumo squat with band above knees","Motor control: squat with band cue knees-out + mirror feedback"],
        exercises:["Clamshell 3×15 (band)","Lateral band walk 3×10m","Glute bridge + abduction band 3×15","Single-leg squat to box knee-over-toe 3×8","Hip thrust 3×12","TKE with band 3×20"]},
      unilateral_knee_valgus:{
        label:"Unilateral Knee Valgus (One Side)",
        meaning:"One knee collapses medially while the other tracks — asymmetric hip abductor weakness often from previous lower limb injury.",
        biomech:"Unilateral glute med inhibition post-injury creates asymmetric loading. Dominant side overcompensates, accelerating asymmetric wear.",
        weak:["Glute med (affected side)","VMO (affected side)","Posterior tibialis (affected side)"],
        tight:["Hip adductors (affected side)","TFL (affected side)"],
        kinetic:"Unilateral collapse → pelvic obliquity → contralateral lumbar QL overload → SI joint rotation.",
        type:"Stability (Asymmetrical)",
        risk:"Unilateral ACL risk, patellofemoral syndrome, SI joint dysfunction.",
        compensation:"Trunk leans toward stronger side to offload affected knee — scoliotic loading pattern.",
        treatment:["Focus glute activation on weaker side only","Single-leg exercises emphasising affected limb","Correct foot pronation with orthotics if structural","Address previous ankle/knee injury — treat inhibition"],
        exercises:["Unilateral clamshell 3×20 (affected)","Single-leg glute bridge 3×12 (affected)","Step-up knee-out cue 3×10 each","Split squat with band 3×10","Y-balance comparison sides"]},
      knee_varus:{
        label:"Knee Varus (Bow-Legged Pattern)",
        meaning:"Knees deviate laterally during squat — IT band/TFL overactivity or structural varus loading lateral compartment.",
        biomech:"IT band + TFL overactivity pulls tibia into varus. Lateral compartment overloaded, medial compartment gapped.",
        weak:["Hip adductors","VMO","Medial hamstring (semimembranosus)"],
        tight:["IT band","TFL","Lateral hamstring","Lateral gastrocnemius"],
        kinetic:"Varus → lateral tibiofemoral overload → lateral meniscus compression → fibular head stress.",
        type:"Mobility + Structural",
        risk:"Lateral meniscus tear, lateral compartment OA, fibular stress fracture.",
        compensation:"Weight shifts medially — excessive pronation at foot to compensate for lateral knee load.",
        treatment:["IT band SMR slow passes 2min/side","TFL stretch figure-4","Strengthen medial stabilisers: adductor squeeze, VMO TKE","Orthotics assessment if structural varus","Gait analysis for varus thrust"],
        exercises:["IT band SMR 2min/side","Adductor squeeze ball 3×20","TKE medial cue 3×15","Sumo squat 3×12","Copenhagen adductor 3×10"]},
      heel_rise:{
        label:"Bilateral Heel Rise",
        meaning:"Both heels lift — primary indicator of ankle dorsiflexion restriction from soft tissue or joint limitation.",
        biomech:"Restricted talocrural joint or gastroc/soleus complex prevents forward tibial translation required for deep squat.",
        weak:["Tibialis anterior","Extensor hallucis longus","Peroneals (secondary)"],
        tight:["Soleus","Gastrocnemius","Posterior ankle joint capsule","Achilles tendon","Plantar fascia (indirect)"],
        kinetic:"Heel rise → CoM shifts anterior → excessive lumbar flexion → knee shear → quad overload → patellar tendon stress.",
        type:"Mobility",
        risk:"Patellar tendinopathy, patellofemoral pain, lumbar disc stress, Achilles tendinopathy.",
        compensation:"Trunk leans forward to maintain balance as heels rise — transfers load to lumbar spine.",
        treatment:["Talocrural posterior glide mob band or manual 2min/side","Gastroc stretch straight knee 3×45s, soleus bent knee 3×45s","Lunge into wall knee-over-toe self mob","Heel-elevated squat → progressively reduce elevation 6-8 weeks","Single-leg balance on inclined surface"],
        exercises:["Wall ankle DF stretch bent knee 3×45s","Band ankle posterior glide mob 2min/side","Heel-elevated goblet squat 3×10 progress to flat","Eccentric heel drop off step 3×15","Ankle alphabets 2×full"]},
      unilateral_heel_rise:{
        label:"Unilateral Heel Rise",
        meaning:"One heel rises while the other stays flat — asymmetric ankle DF restriction from previous ankle sprain or immobilisation.",
        biomech:"Unilateral posterior capsule tightening from lateral ankle sprain restricts DF on affected side only.",
        weak:["Tibialis anterior (affected side)"],
        tight:["Posterior ankle capsule (affected)","Gastroc/soleus (affected)"],
        kinetic:"Asymmetric heel rise → ipsilateral knee valgus → contralateral hip drop → scoliotic trunk lean.",
        type:"Mobility (Asymmetrical)",
        risk:"Recurrent ankle sprain, ipsilateral knee pathology, contralateral hip overload.",
        compensation:"Body weight shifts to unaffected side — asymmetric lower limb loading.",
        treatment:["Unilateral ankle mob priority — anterior talar glide 2min affected","Address previous ankle sprain history and scar tissue","Proprioception board affected side 3×30s"],
        exercises:["Unilateral ankle DF lunge stretch 3×45s (affected)","Banded ankle mob 2min (affected)","Single-leg heel-elevated squat progression (affected)","Towel scrunches intrinsic 3×30s","Proprioception board (affected) 3×30s"]},
      trunk_lean_forward:{
        label:"Excessive Trunk Forward Lean",
        meaning:"Torso collapses forward — restricted thoracic mobility and/or hip mobility combined with poor anterior core activation.",
        biomech:"Limited thoracic extension or hip flexion ROM forces trunk forward to maintain CoM over BoS. Anterior core weakness allows passive collapse into lumbar flexion.",
        weak:["Thoracic erector spinae","Deep cervical flexors","Anterior core (TA, obliques, multifidus)","Hip flexors (insufficient eccentric control)"],
        tight:["Thoracic paraspinals (kyphotic shortening)","Hip flexors (iliopsoas)","Thoracolumbar fascia","Anterior hip capsule"],
        kinetic:"Trunk lean → lumbar flexion moment increases → disc posterior migration → hip anterior impingement → patellar tendon overload.",
        type:"Mobility + Motor Control",
        risk:"Lumbar disc herniation, hip FAI, patellar tendinopathy.",
        compensation:"Lumbar hyperflexes to lower CoM while trunk falls forward — entire posterior structure under load.",
        treatment:["Thoracic mob: foam roller extension 2min, open-book rotation 3×10/side","Hip flex mob: couch stretch 3×60s, anterior hip capsule mob","Core: dead bug 3×10, bird-dog 3×10","Squat cue: chest up, elbows up — goblet squat as corrective","Overhead squat PVC pipe to feel upright"],
        exercises:["Thoracic foam roll extension 2min","Cat-cow 2×15","Goblet squat chest up 3×10","Dead bug 3×10/side","Box squat broomstick overhead 3×10","Couch stretch 3×60s/side"]},
      lateral_trunk_lean:{
        label:"Lateral Trunk Lean / Side-Shift",
        meaning:"Trunk shifts laterally during descent — unilateral hip mobility restriction or leg length discrepancy causing CoM compensation.",
        biomech:"Body shifts toward the more restricted hip to unload that hip's mobility demand, creating asymmetric spinal loading.",
        weak:["Contralateral hip abductors","Contralateral QL","Lateral core stabilisers"],
        tight:["Hip capsule (restricted side)","QL (ipsilateral to lean)","IT band"],
        kinetic:"Lateral trunk lean → lumbar lateral flexion → facet joint compression ipsilateral → SI joint torsion.",
        type:"Mobility (Asymmetrical) + Motor Control",
        risk:"SI joint dysfunction, lumbar facet irritation, hip labral pathology.",
        compensation:"Trunk lean toward restricted side reduces hip flexion demand — masks asymmetric restriction.",
        treatment:["Hip capsule mob: 90/90 stretch, lying IR stretch 3×45s restricted side","QL stretch lateral side bend 3×30s","Lateral core: side plank 3×30s, Pallof press 3×12","Reassess leg length — refer if >1cm discrepancy"],
        exercises:["90/90 hip stretch 3×45s restricted side","Side plank 3×30s each","Pallof press 3×12 each direction","Single-leg squat restricted side emphasis 3×8","Lateral step-down 3×10 each"]},
      arms_drop:{
        label:"Arms Drop / Cannot Maintain Overhead",
        meaning:"Unable to keep arms extended overhead — thoracic kyphosis, lat tightness or shoulder flexion restriction.",
        biomech:"Limited shoulder flexion ROM from lat/pec minor tightness or thoracic kyphosis cannot maintain overhead arm as squat depth increases thoracic demand.",
        weak:["Lower trapezius","Serratus anterior","Thoracic extensors"],
        tight:["Latissimus dorsi","Pec minor","Posterior shoulder capsule","Thoracic paraspinals"],
        kinetic:"Arms forward → trunk leans → lumbar flexion increases → full spine loading chain.",
        type:"Mobility",
        risk:"Shoulder impingement, lumbar disc stress, thoracic hyperkyphosis progression.",
        compensation:"Elbows bend and arms move forward — reduces overhead shoulder demand at cost of trunk position.",
        treatment:["Lat stretch doorway + side bend 3×30s","Thoracic extension foam roller + open-book","Lower trap Y-T-W prone 3×12, wall slide 3×12","Overhead mobility: dowel overhead squat practice"],
        exercises:["Lat doorway stretch 3×30s","Thoracic foam roll 2min","Y-T-W prone 3×12","Wall slide 3×12","Overhead dowel squat practice 3×10"]},
      foot_pronation:{
        label:"Foot Pronation / Arch Collapse",
        meaning:"Medial arch collapses — intrinsic foot muscle weakness and posterior tibialis insufficiency.",
        biomech:"Arch collapse → talus adducts and plantarflexes → tibial IR → femoral IR → knee valgus. Foot is the foundation of the kinetic chain.",
        weak:["Posterior tibialis","Peroneus longus","Intrinsic foot muscles (FDB, abductor hallucis)","Flexor hallucis longus"],
        tight:["Plantar fascia","Gastrocnemius","Achilles tendon"],
        kinetic:"Pronation → tibial IR → femoral IR → knee valgus → hip adduction → lumbar rotation.",
        type:"Stability + Mobility",
        risk:"Plantar fasciitis, posterior tibialis dysfunction, patellofemoral pain, tibial stress fracture.",
        compensation:"Knee valgus and hip IR compensate — transfers load medially through entire chain.",
        treatment:["Intrinsic strengthening: short foot exercise, toe spread, marble pick-up","Posterior tibialis: single-leg heel raise inversion bias 3×15","Plantar fascia stretch 3×30s","Orthotics if structural pes planus","Proprioception single-leg balance arch cue"],
        exercises:["Short foot exercise 3×10s holds","Towel scrunches 3×30s","Single-leg heel raise inversion bias 3×15","Plantar fascia stretch 3×30s","Barefoot balance training 3×30s/side"]},
      anterior_pelvic_tilt:{
        label:"Anterior Pelvic Tilt During Squat",
        meaning:"Pelvis tilts anteriorly during descent — hip flexor dominance preventing neutral pelvis.",
        biomech:"Tight iliopsoas and rectus femoris anteriorly rotate pelvis as depth increases, creating lumbar hyperlordosis.",
        weak:["Gluteus maximus","Hamstrings","Anterior core (rectus abdominis)"],
        tight:["Iliopsoas","Rectus femoris","TFL","Anterior hip capsule"],
        kinetic:"Anterior tilt → lumbar extension → L4-5 compression → SI joint anterior rotation → hip impingement.",
        type:"Mobility + Motor Control",
        risk:"Lumbar facet arthropathy, hip FAI, SI joint dysfunction.",
        compensation:"Lumbar lordosis increases as pelvis tilts — unloads hip at expense of spinal extension.",
        treatment:["Hip flexor: couch stretch 3×60s, kneeling stretch","Pelvic clock awareness: anterior → neutral → posterior drill","Core: dead bug with posterior pelvic tilt hold","Glute activation: glute bridge posterior tilt cue"],
        exercises:["Couch stretch 3×60s/side","Kneeling hip flex stretch 3×45s","Pelvic clock supine 3×10","Dead bug 3×10","Glute bridge neutral pelvis 3×12"]},
      butt_wink:{
        label:"Butt Wink (Posterior Pelvic Tilt at Depth)",
        meaning:"Pelvis posteriorly rotates at depth — hamstring tethering forces lumbar flexion at end-range squat.",
        biomech:"Hamstrings pull ischium posteriorly at depth, converting lumbar lordosis to flexion. Posterior disc shear force increases significantly.",
        weak:["Multifidus","Lumbar stabilisers","TA"],
        tight:["Hamstrings (primarily)","Posterior hip capsule"],
        kinetic:"Butt wink → lumbar flexion under load → posterior annular stress → disc herniation risk at depth.",
        type:"Mobility",
        risk:"Lumbar disc herniation, posterior annulus tear — highest risk under loaded squat.",
        compensation:"Lumbar flexion allows pelvis to continue rotating when hip flexion ROM exhausted.",
        treatment:["Hamstring: SLR neural glide 2×10, supine towel stretch 3×45s","Squat depth management: stop above pelvic tuck point","Hip mob: 90/90 stretch, pigeon pose 3×60s","Lumbar stabilisation: bird-dog, dead bug before loaded squats"],
        exercises:["Supine hamstring stretch towel 3×45s","SLR neural glide 2×10 oscillations","Hip 90/90 stretch 3×45s/side","Goblet squat limit depth to neutral pelvis 3×10","Box squat sit to box before tuck 3×12"]},
      cervical_compensation:{
        label:"Forward Head / Cervical Compensation",
        meaning:"Head juts forward or chin protrudes during squat — deep cervical flexor weakness and/or global fatigue pattern.",
        biomech:"As trunk falls forward, head protrudes to maintain visual horizon. Each 2.5cm forward head posture adds ~5kg load to cervical extensors.",
        weak:["Longus colli","Longus capitis","Lower trapezius","Thoracic extensors"],
        tight:["Suboccipital muscles","Upper trapezius","SCM","Thoracic paraspinals"],
        kinetic:"Cervical compensation → suboccipital compression → headache risk → upper trap overactivation → shoulder elevation chain.",
        type:"Motor Control + Posture",
        risk:"Cervical facet irritation, headache, upper trapezius overuse, shoulder impingement.",
        compensation:"Global extension strategy — posterior chain activates pulling head forward or backward.",
        treatment:["Chin tuck jowl exercise 3×10 5s holds","Suboccipital release manual or tennis ball 2min","Thoracic extension mob: foam roller","Cue: eyes on horizon during squat"],
        exercises:["Chin tuck supine 3×10 5s holds","Suboccipital self-release tennis ball 2min","Thoracic foam roll 2min","Chin tuck hold during squat 3×10","Shoulder retraction neck neutral 3×15"]},
      loss_of_balance_sq:{
        label:"Loss of Balance / Instability",
        meaning:"Patient sways or grabs support — vestibular, proprioceptive, or ankle/hip stability deficit.",
        biomech:"Squat challenges multi-segmental proprioceptive integration. Any deficit at foot, ankle, knee, hip, or CNS level disrupts postural sway.",
        weak:["Peroneals","Tibialis anterior","Intrinsic foot muscles","Hip abductors","Core stabilisers"],
        tight:["Posterior ankle capsule"],
        kinetic:"Instability → compensatory joint stiffening → reduced shock absorption → increased injury risk.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, ankle sprains, inability to decelerate in sport.",
        compensation:"Widening stance, arms forward, trunk lean — reduce balance demand at cost of movement quality.",
        treatment:["Progression: bilateral → narrow stance → tandem → single-leg","Eyes open → eyes closed","Stable → foam pad → Bosu → trampoline","Y-balance test to quantify reach asymmetry"],
        exercises:["Narrow stance squat 3×10","Single-leg balance firm 3×30s","Single-leg balance eyes closed 3×20s","Bosu squat 3×10","Perturbation training partner taps 3×30s"]},
      tremor_shaking:{
        label:"Tremor / Shaking During Movement",
        meaning:"Visible tremor during squat — neuromuscular fatigue, inadequate motor unit recruitment, or significant deconditioning.",
        biomech:"Insufficient motor unit synchronisation to maintain position under load. May indicate severe deconditioning or neurological issue.",
        weak:["Global lower extremity musculature","Core stabilisers"],
        tight:["Not primary — neuromuscular issue"],
        kinetic:"Tremor → inefficient force production → increased injury risk under dynamic loading.",
        type:"Motor Control + Neuromuscular",
        risk:"Sudden giving way, fall risk, inability to absorb loading forces.",
        compensation:"Rapid descent/ascent to avoid sustained loading demand.",
        treatment:["Graded strengthening — regress to pain-free, fatigue-free range","Isometric wall sit 3×20s progress to 60s","NMES if severe inhibition","Rule out neurological cause — refer if persistent"],
        exercises:["Wall sit 3×20s progress duration","Leg press 3×15 controlled","Step-up 3×10 each","Isometric squat hold 60° 3×20s","Cycling or swimming if severe deconditioning"]}
    }
  },
  hs:{
    label:"Hurdle Step", icon:"🏃",
    how:"Hurdle at tibial tuberosity height. Dowel behind neck across shoulders. Step over hurdle, touch heel to ground, return. Both sides. Observe anterior and lateral.",
    cues:["Stance leg fully extended throughout","Stepping hip must fully flex over hurdle","No hurdle contact","Return under full control","Dowel remains horizontal and still"],
    scoring:"3=No trunk shift, hips level, dowel horizontal, full step-over. 2=Trunk shift OR hip drop OR dowel tilts. 1=Foot touches hurdle OR loss of balance. 0=Pain.",
    defects:{
      hip_drop_trendelenburg:{
        label:"Hip Drop — Trendelenburg Sign",
        meaning:"Pelvis drops on the swing side during single-leg stance — stance-side gluteus medius insufficiency.",
        biomech:"Glute med generates abductor torque to level pelvis in single-leg stance. Insufficient force → pelvis drops → trunk leans ipsilaterally to shift CoM over foot.",
        weak:["Gluteus medius (stance side — primary)","Gluteus minimus","TFL (secondary)","Piriformis"],
        tight:["Contralateral QL","Hip adductors (stance side)"],
        kinetic:"Hip drop → lateral trunk lean → IT band tension → contralateral SI joint compression → knee valgus cascade.",
        type:"Stability",
        risk:"IT band syndrome, patellofemoral pain, SI joint dysfunction, contralateral lumbar overload.",
        compensation:"Ipsilateral trunk lean (compensated Trendelenburg) — shifts CoM masking abductor weakness.",
        treatment:["Activate: clamshell 3×20, side-lying abduction 3×15","Weight-bearing: lateral band walk, lateral step-up","Stability: mirror feedback single-leg, perturbation","Functional: step-over pelvic level cue, single-leg RDL"],
        exercises:["Clamshell 3×20 band","Side-lying hip abduction 3×15","Lateral band walk 3×12m","Single-leg stance level pelvis mirror 3×30s","Lateral step-up 3×10 each","Single-leg deadlift 3×8"]},
      lateral_trunk_shift:{
        label:"Lateral Trunk Shift / Lean",
        meaning:"Trunk deviates laterally during stance — compensatory strategy for abductor weakness or QL tightness.",
        biomech:"Insufficient hip abductor torque on stance side → trunk leans ipsilaterally to shift CoM medially, reducing abductor demand.",
        weak:["Glute med (stance side)","Lateral core (QL, obliques)","Contralateral hip abductors"],
        tight:["QL (ipsilateral to lean)","Hip adductors","Thoracolumbar fascia (lateral)"],
        kinetic:"Trunk shift → asymmetric lumbar facet loading → disc lateral compression → sciatica risk.",
        type:"Stability + Motor Control",
        risk:"Lumbar facet arthropathy, sciatica, hip impingement.",
        compensation:"Trunk lean shifts CoM — uses trunk mass to stabilise rather than muscle force.",
        treatment:["QL stretch standing side bend 3×30s each","Lateral core: side plank 3×30-60s, suitcase carry 3×20m","Glute med activation protocol","Cue: keep pelvis level and trunk upright"],
        exercises:["Side plank 3×30s to 60s","Pallof press 3×12 each","QL side bend stretch 3×30s","Suitcase carry 3×20m each","Single-leg RDL 3×8 each"]},
      insufficient_hip_flexion:{
        label:"Insufficient Hip Flexion / Step Height",
        meaning:"Stepping hip cannot achieve adequate flexion to clear hurdle — hip flexor weakness or posterior capsule restriction.",
        biomech:"Iliopsoas and rectus femoris generate hip flexion; if limited, patient compensates with trunk lean or toe drag. Hip FAI may limit deep flexion.",
        weak:["Iliopsoas","Rectus femoris","TFL hip flexion component"],
        tight:["Posterior hip capsule","Hamstrings (restrict pelvic rotation)","Piriformis"],
        kinetic:"Insufficient hip flex → toe drag → falls risk → compensatory lumbar flexion → disc load.",
        type:"Mobility + Strength",
        risk:"Trip/fall injury, hip FAI irritation, lumbar disc stress.",
        compensation:"Trunk leans forward and pelvis tilts posteriorly to achieve apparent hip flexion — uses lumbar range.",
        treatment:["Hip flexor strengthening: lying leg raise 3×12, standing hip flex band 3×15","Hip capsule mob: posterior glide, prone mob","ASLR to differentiate strength vs mobility","Step training: progressive hurdle height"],
        exercises:["Lying leg raise 3×12","Standing hip flex band 3×15","Posterior hip capsule stretch pigeon 3×60s","Progressive hurdle step lower height","Lunge with high knee drive 3×10"]},
      stance_knee_flexion:{
        label:"Stance Leg Knee Flexion",
        meaning:"Stance knee bends during step-over — quadriceps weakness or pain-avoidance pattern.",
        biomech:"Single-leg knee extension requires strong VMO and rectus femoris engagement. Failure indicates quad insufficiency or pain avoidance.",
        weak:["Vastus lateralis","VMO","Rectus femoris"],
        tight:["Hamstrings","Gastrocnemius"],
        kinetic:"Knee flexion on stance → increased patellofemoral joint reaction → quad tendon stress.",
        type:"Stability + Strength",
        risk:"Patellar tendinopathy, patellofemoral pain, knee OA progression.",
        compensation:"Trunk leans forward to reduce extension moment arm — reduces quad demand at cost of spinal position.",
        treatment:["Quad strengthening: TKE 3×20, step-up 3×12","VMO emphasis: short arc quad, TKE medial cue","Single-leg press 3×12 progressing to single-leg squat","Cue: lock the knee — stand tall"],
        exercises:["TKE band 3×20","Short arc quad 3×15","Step-up 3×12 each","Single-leg press 3×12","Wall sit 3×30s"]},
      loss_of_balance_hs:{
        label:"Loss of Balance on Stance Leg",
        meaning:"Postural sway or support-seeking — proprioceptive and/or ankle/hip stability deficit.",
        biomech:"Single-leg balance integrates vestibular, visual, somatosensory input. Deficit at ankle, hip, or CNS creates instability.",
        weak:["Peroneals","Tibialis anterior","Intrinsic foot muscles","Glute med"],
        tight:["Posterior ankle capsule"],
        kinetic:"Balance loss → compensatory co-contraction → increased energy cost → fall risk in dynamic environments.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, ankle sprain recurrence, inadequate deceleration.",
        compensation:"Wide arm abduction, trunk lean, rapid foot placement — reduce balance challenge.",
        treatment:["Single-leg balance: firm → foam → Bosu → trampoline","Eyes open → eyes closed","Perturbation: partner taps, ball toss","Y-balance test quantification"],
        exercises:["Single-leg balance firm 3×30s","Single-leg balance eyes closed 3×20s","Bosu single-leg 3×30s","Perturbation training 3×30s","Y-balance 3 directions"]},
      hurdle_contact:{
        label:"Foot Contacts Hurdle",
        meaning:"Stepping limb touches hurdle — insufficient hip flexion, foot clearance, or coordination deficit.",
        biomech:"Inadequate hip flexion strength or coordination fails to achieve required limb trajectory over hurdle height.",
        weak:["Hip flexors stepping side","Tibialis anterior foot DF for clearance"],
        tight:["Posterior hip capsule","Hamstrings limit flexion"],
        kinetic:"Repeated hurdle contact → trip mechanism → falls risk in functional environments.",
        type:"Motor Control + Mobility",
        risk:"Trip injury, reduced dynamic foot clearance in gait, stair navigation impairment.",
        compensation:"Trunk lean increases apparent hip flexion — foot clears using trunk position.",
        treatment:["Practice step-over at progressive heights","Hip flexor strengthening","Anterior tibialis: ankle DF strengthening","Motor control: slow step-over visual feedback"],
        exercises:["Standing hip flex band 3×15","Ankle DF strengthening foot on ledge lift toes 3×20","Slow hurdle step visual feedback 3×10","Marching high knee drive 3×30s","Step-up to high box 3×10"]},
      dowel_tilt:{
        label:"Dowel Tilts / Shoulders Not Level",
        meaning:"Dowel tilts indicating unilateral shoulder or thoracic restriction or asymmetric trunk lean.",
        biomech:"Unilateral thoracic restriction or QL tightness creates ipsilateral lateral flexion, tilting dowel.",
        weak:["Contralateral lateral core","Lower trapezius restricted side"],
        tight:["QL (tilt side)","Thoracic rotators","Thoracolumbar fascia unilateral"],
        kinetic:"Dowel tilt → trunk rotation → asymmetric spinal loading → SI joint torsion.",
        type:"Mobility (Asymmetrical)",
        risk:"Thoracic asymmetry, SI joint dysfunction, unilateral shoulder impingement.",
        compensation:"Trunk compensates by laterally flexing to achieve step-over, tilting dowel.",
        treatment:["QL stretch tilt side 3×30s","Thoracic rotation mob restricted side 3×10","Lateral core: side plank weaker side 3×30s","Check SM test for shoulder mobility contribution"],
        exercises:["QL side bend stretch restricted 3×30s","Thoracic rotation foam roll restricted side 1min","Side plank weaker side 3×30s","Open-book rotation 3×10/side","Horizontal adduction stretch 3×30s"]}
    }
  },
  il:{
    label:"Inline Lunge", icon:"🦵",
    how:"Stand on a line, feet tandem heel-to-toe. Dowel vertical behind back — 3 contacts: back of head, thoracic spine, sacrum. Lower rear knee to line, return. Both sides.",
    cues:["Front foot completely flat on line","Rear knee lowers to — not slams into — line","Dowel maintains all 3 contacts","No trunk rotation or lateral lean","Foot stays on line — no step-off"],
    scoring:"3=All dowel contacts maintained, no deviation, controlled. 2=Dowel loses contact OR knee deviates OR step-off. 1=Loss of balance prevents completion. 0=Pain.",
    defects:{
      trunk_rotation_il:{
        label:"Trunk Rotation",
        meaning:"Spine rotates during lunge — inadequate hip mobility forcing lumbar rotation to compensate.",
        biomech:"Restricted hip IR or ER forces lumbar spine to rotate to allow limb advancement. Dowel loses thoracic contact first, then head contact.",
        weak:["Deep core multifidus TA","Anti-rotation obliques","Hip rotators restricted side"],
        tight:["Hip joint capsule IR restriction","Thoracolumbar fascia","Piriformis","Hip flexors creating torsion"],
        kinetic:"Trunk rotation → asymmetric lumbar facet loading → SI joint torsion → contralateral hip impingement.",
        type:"Mobility + Motor Control",
        risk:"Lumbar facet arthropathy, disc annular stress, SI joint dysfunction.",
        compensation:"Spine rotates to allow hip past its ROM — lumbar substitutes for hip mobility.",
        treatment:["Hip IR mob: prone IR AROM, FABER stretch 3×45s","Anti-rotation: Pallof press 3×12, half-kneeling chop 3×10","Motor control: lunge holding dowel contacts — coach rotation","Progress: add resistance when contacts maintained"],
        exercises:["Pallof press 3×12 each direction","Half-kneeling anti-rotation hold 3×30s","Hip IR stretch seated 3×45s","Lunge with dowel visual feedback 3×8","Cable chop lunge position 3×10"]},
      front_knee_valgus_il:{
        label:"Front Knee Valgus",
        meaning:"Forward knee collapses medially — single-leg abductor and VMO demand exceeds capacity.",
        biomech:"Single-leg loading amplifies hip abductor demand. VMO insufficiency allows lateral patellar tracking. Adductors dominate.",
        weak:["Glute med front leg","VMO","Deep hip ER"],
        tight:["Hip adductors","TFL/IT band","Lateral hamstring"],
        kinetic:"Knee valgus → medial patellar maltracking → ACL valgus stress → medial meniscus compression.",
        type:"Stability",
        risk:"ACL injury, patellofemoral syndrome, medial meniscus degeneration.",
        compensation:"Trunk leans toward collapse side — reduces valgus appearance but increases SI stress.",
        treatment:["Band cue above knee during lunge RNT","Single-leg glute work: clamshell → step-up → split squat","VMO: TKE 3×20, short arc quad 3×15","Mirror feedback: watch knee during lunge"],
        exercises:["Lateral band walk 3×15","TKE band 3×20","Step-up knee-out cue 3×10","Split squat band above knee 3×10","Single-leg press valgus cue 3×12"]},
      rear_knee_valgus_il:{
        label:"Rear Knee Valgus",
        meaning:"Rear knee collapses medially during descent — hip abductor weakness on rear leg side.",
        biomech:"Rear hip abductors must stabilise pelvis and femur in adducted single-leg position. Weakness creates medial collapse.",
        weak:["Glute med rear leg side","Hip ER rear leg","VMO rear leg"],
        tight:["Adductors rear leg side"],
        kinetic:"Rear knee valgus → pelvic torsion → lumbar rotation → SI joint loading.",
        type:"Stability",
        risk:"Patellofemoral pain rear side, patellar tendon stress, SI joint dysfunction.",
        compensation:"Pelvic rotation compensates — trunk shifts to offload rear knee.",
        treatment:["Rear leg glute med activation","Bulgarian split squat 3×10","Cue: keep rear knee pointing straight down","Band above rear knee as tactile cue"],
        exercises:["Rear leg clamshell 3×20","Bulgarian split squat 3×10","Rear knee tracking split squat 3×10","Single-leg bridge rear leg 3×12","Lateral step-up rear leg dominant 3×10"]},
      lateral_trunk_lean_il:{
        label:"Lateral Trunk Lean",
        meaning:"Trunk leans laterally during lunge — QL tightness or hip abductor weakness causing CoM shift.",
        biomech:"Lateral trunk lean shifts CoM medially to reduce hip abductor demand, masking weakness.",
        weak:["Lateral core QL obliques","Hip abductors front leg"],
        tight:["QL ipsilateral to lean"],
        kinetic:"Lateral lean → asymmetric spinal loading → facet compression lean side → contralateral disc stress.",
        type:"Stability + Motor Control",
        risk:"Lumbar facet irritation, lateral disc bulge, SI joint torsion.",
        compensation:"Trunk leans to reduce abductor demand and maintain balance — increases spinal load.",
        treatment:["QL stretch standing side bend 3×30s","Side plank 3×30s to 60s","Pallof press 3×12 each","Lunge trunk upright cueing mirror"],
        exercises:["Side plank 3×30s each","Pallof press 3×12 each direction","QL side bend stretch 3×30s","Suitcase carry 3×20m each","Lateral step-up 3×10"]},
      loss_of_balance_il:{
        label:"Loss of Balance / Step-Off Line",
        meaning:"Cannot maintain narrow-base tandem stance — proprioceptive or stability deficit.",
        biomech:"Tandem stance dramatically reduces BoS, amplifying single-plane balance demand.",
        weak:["Peroneals","Tibialis anterior","Intrinsic foot muscles","Hip abductors"],
        tight:["Posterior ankle capsule"],
        kinetic:"Repeated balance loss → inefficient patterns → fall risk in narrow corridors or sport.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, ankle injury, inability to perform cutting movements.",
        compensation:"Wide arm abduction, trunk rotation, foot widening — reduce tandem demand.",
        treatment:["Tandem balance 3×30s progressing to eyes closed","Single-leg on unstable surface","Y-balance quantification","Ankle proprioception: wobble board, Bosu"],
        exercises:["Tandem stance balance 3×30s","Tandem balance eyes closed 3×20s","Single-leg balance foam pad 3×30s","Bosu single-leg 3×30s","Tandem walk tightrope 3×10m"]},
      rear_hip_extension_deficit:{
        label:"Rear Hip Extension Deficit",
        meaning:"Rear hip cannot achieve full extension — hip flexor tightness or anterior capsule restriction.",
        biomech:"Iliopsoas shortening prevents full hip extension, causing anterior pelvic tilt and lumbar lordosis.",
        weak:["Gluteus maximus rear leg","Hamstrings rear leg"],
        tight:["Iliopsoas","Rectus femoris","Anterior hip capsule","TFL"],
        kinetic:"Hip flex restriction → anterior pelvic tilt → lumbar hyperextension → L4-5 disc posterior compression.",
        type:"Mobility",
        risk:"Hip flexor injury, lumbar disc herniation extension type, SI joint irritation.",
        compensation:"Anterior pelvic tilt increases lumbar lordosis to achieve lunge depth — sacrifices spinal position.",
        treatment:["Couch stretch 3×60s priority","Anterior hip capsule mob prone on elbows","Kneeling hip flex stretch with posterior pelvic tilt","Glute max activation: prone hip extension, hip thrust"],
        exercises:["Couch stretch 3×60s/side","Kneeling hip flex stretch posterior tilt 3×45s","Half-kneeling lunge upright trunk 3×10","Hip thrust 3×12","Single-leg RDL 3×10"]},
      foot_rotation_il:{
        label:"Foot Rotation Off Line",
        meaning:"Front or rear foot rotates off line — hip rotation restriction forcing foot ER to achieve clearance.",
        biomech:"Limited hip IR forces foot into ER as compensation — reduces medial arch stress but creates rotational knee loading.",
        weak:["Hip IR muscles TFL anterior glute med"],
        tight:["Hip ER muscles piriformis obturators gemelli","Posterior hip capsule"],
        kinetic:"Foot ER → tibial ER → knee lateral rotation → patellofemoral maltracking.",
        type:"Mobility",
        risk:"Patellofemoral syndrome, IT band syndrome, lumbar rotation stress.",
        compensation:"Foot ER allows hip to clear limited IR range — avoids discomfort at cost of alignment.",
        treatment:["Hip IR mob: prone IR AROM, seated IR stretch 3×45s","Pigeon pose hip ER stretch 3×60s","Lunge practice with foot placement cue tape on floor"],
        exercises:["Hip IR stretch seated 3×45s","Pigeon pose ER stretch 3×60s","Lunge with foot-on-tape line cue 3×10","Single-leg squat rotation awareness 3×10","Cossack squat 3×10 each"]}
    }
  },
  sm:{
    label:"Shoulder Mobility", icon:"💪",
    how:"Make a fist both hands thumbs inside. Simultaneously reach one hand up behind the head and the other up the back. Measure fist-to-fist distance. Both sides. CLEARING TEST: Push-up impingement test — pain = score 0.",
    cues:["Make a tight fist — thumb inside","Both hands move simultaneously","Record knuckle-to-knuckle distance","Measure against patient's own hand-length","Clearing test mandatory"],
    scoring:"3=Within 1 hand-length. 2=Within 1.5 hand-lengths. 1=More than 1.5 hand-lengths. 0=Pain.",
    defects:{
      limited_overhead_sm:{
        label:"Limited Shoulder Flexion + IR (Overhead Restricted)",
        meaning:"Arm cannot reach adequately behind the head — restricted GH flexion, IR, or thoracic extension.",
        biomech:"Posterior capsule tightness or pec minor shortening limits GH IR in elevation. Thoracic kyphosis reduces scapular upward rotation capacity, compressing subacromial space.",
        weak:["Lower trapezius","Serratus anterior","Posterior rotator cuff (infraspinatus, teres minor)"],
        tight:["Pec minor","Pec major (anterior fibres)","Anterior GH capsule","Subscapularis","Thoracic paraspinals"],
        kinetic:"Restricted overhead → compensatory scapular elevation → upper trap dominance → cervical load → impingement.",
        type:"Mobility",
        risk:"Subacromial impingement, rotator cuff tears, cervical radiculopathy, AC joint stress.",
        compensation:"Scapular elevation + contralateral trunk lean to achieve overhead reach.",
        treatment:["Pec minor: corner stretch or doorway 3×30s","Thoracic extension foam roller T-spine 2min","GH posterior glide mob manual or self-stretch","Lower trap Y-T-W prone 3×12","Sleeper stretch 3×30s","Wall slide scapular depression cue 3×12"],
        exercises:["Pec minor doorway stretch 3×30s","Thoracic foam roll 2min","Y-T-W prone 3×12","Wall slide 3×12","Sleeper stretch 3×30s","Shoulder flexion AROM 2×10"]},
      gird:{
        label:"GIRD — Glenohumeral IR Deficit (Behind-Back Restricted)",
        meaning:"Arm cannot reach behind the back — GH internal rotation deficit, classic in overhead athletes.",
        biomech:"Posterior capsule tightening from repetitive overhead loading reduces GH IR. Creates obligate humeral head superior migration and posterior labrum stress.",
        weak:["Posterior rotator cuff (infraspinatus, teres minor)","Rhomboids","Serratus anterior"],
        tight:["Posterior GH capsule","Posterior rotator cuff adaptive shortening","Teres major"],
        kinetic:"GIRD → scapular anterior tilt → subacromial narrowing → superior labrum stress → SLAP risk.",
        type:"Mobility",
        risk:"SLAP tear, posterior labral injury, subacromial impingement, rotator cuff degeneration.",
        compensation:"Trunk rotation and scapular protraction to achieve internal reach.",
        treatment:["Sleeper stretch BEST for GIRD 3×30s side-lying","Cross-body posterior capsule stretch 3×30s","GH posterior glide mobilisation","Rotator cuff ER: side-lying band ER 3×15","Scapular retraction rows, face pulls 3×15"],
        exercises:["Sleeper stretch 3×30s each","Cross-body cuff stretch 3×30s","Band ER side-lying 3×15 each","Scapular retraction row 3×12","Face pull 3×15"]},
      bilateral_asymmetry_sm:{
        label:"L/R Asymmetry (>1 Hand-Length Difference)",
        meaning:"Significant side-to-side difference — highest FMS injury predictor. Unilateral restriction from previous injury or sport.",
        biomech:"Asymmetric capsular tightness or muscle shortening restricts one side disproportionately. Creates compensatory spinal patterns.",
        weak:["Restricted side posterior rotator cuff","Restricted side lower trap"],
        tight:["Dominant throwing arm posterior capsule","Restricted side pec minor"],
        kinetic:"Asymmetry → compensatory scoliotic trunk → uneven rib cage → cervical dysfunction.",
        type:"Mobility (Asymmetrical)",
        risk:"High asymmetric injury risk — strongest FMS predictor.",
        compensation:"Trunk lateral lean and rotation to compensate restricted side reach.",
        treatment:["Priority: stretch ONLY restricted side until symmetric","Reassess every 4 weeks","Do not aggravate overhead loading until symmetric","Address dominant arm overload sport-specific"],
        exercises:["Unilateral sleeper stretch restricted side 3×30s","Unilateral pec stretch restricted 3×30s","Thoracic rotation toward restricted side 3×10","Unilateral shoulder mob until symmetric","Bilateral ER strengthening after symmetry"]},
      scapular_elevation_sm:{
        label:"Scapular Elevation / Shoulder Shrug During Reach",
        meaning:"Shoulder elevates during reach — upper trapezius dominance compensating for lower trap and serratus weakness.",
        biomech:"Upper trap fires to achieve apparent shoulder elevation when lower trap and serratus cannot generate adequate upward rotation torque.",
        weak:["Lower trapezius","Serratus anterior","Middle trapezius"],
        tight:["Upper trapezius","Levator scapulae","SCM"],
        kinetic:"Scapular elevation → cervical compression → upper trap overuse → AC joint stress → thoracic outlet potential.",
        type:"Motor Control + Stability",
        risk:"Thoracic outlet syndrome, AC joint pathology, cervicogenic headache.",
        compensation:"Shrugging substitutes for proper scapular upward rotation — wrong muscle sequence.",
        treatment:["Upper trap inhibition: SMR upper trap 90s/side","Lower trap: Y-T-W prone, wall slide depression cue","Scapular PNF: depression + retraction","Motor control: shoulder flex with scapular depression hold"],
        exercises:["Upper trap SMR ball against wall 90s/side","Y-T-W prone 3×12","Wall slide depress scapula during slide 3×12","Scapular depression holds 3×10 5s","Face pull 3×15"]},
      scapular_winging_sm:{
        label:"Scapular Winging",
        meaning:"Medial border of scapula lifts — serratus anterior weakness or long thoracic nerve dysfunction.",
        biomech:"Serratus anterior holds scapula against thorax and generates upward rotation. Weakness or inhibition allows winging, reducing overhead ROM.",
        weak:["Serratus anterior (primary)","Lower trapezius","Middle trapezius"],
        tight:["Pec minor (tips scapula anteriorly causing winging)"],
        kinetic:"Winging → reduced GH ROM → impingement → rotator cuff compensation → cervical chain overload.",
        type:"Stability + Motor Control",
        risk:"Subacromial impingement, rotator cuff stress, long thoracic neuropathy.",
        compensation:"Shoulder elevation and trunk lean substitute for inadequate scapular control.",
        treatment:["Serratus: wall push-up plus protraction 3×15","Push-up with serratus plus extra protraction at top","Pec minor stretch to release scapular depression","Refer if severe — long thoracic nerve injury"],
        exercises:["Wall push-up plus protraction 3×15","Push-up plus on knees 3×12","Serratus punch band 3×15","Pec minor corner stretch 3×30s","Scapular protraction drills 3×10"]},
      cervical_lateral_flex_sm:{
        label:"Cervical Lateral Flexion / Head Tilt",
        meaning:"Head tilts during shoulder reach — cervical mobility deficit or upper trap tightness creating neck movement as compensation.",
        biomech:"Restricted ipsilateral cervical lateral flexion forces head to tilt to allow trunk side-bend for apparent shoulder reach.",
        weak:["Contralateral deep cervical flexors","Contralateral SCM"],
        tight:["Ipsilateral upper trapezius","Ipsilateral SCM","Scalenes","Levator scapulae"],
        kinetic:"Cervical compensation → suboccipital compression → cervicogenic headache → upper limb neural tension.",
        type:"Mobility + Motor Control",
        risk:"Cervicogenic headache, cervical radiculopathy C4-6, thoracic outlet syndrome.",
        compensation:"Head tilts to create extra trunk side-bending allowing limited shoulder to appear to reach further.",
        treatment:["Cervical lateral flexion stretch ear to shoulder 3×30s","Upper trap stretch + SCM stretch","Cervical rotation mob gentle AROM 3×10","Address shoulder mobility as primary driver"],
        exercises:["Ear-to-shoulder stretch 3×30s each","Upper trap stretch 3×30s each","Cervical rotation AROM 3×10 each","Levator scapulae stretch 3×30s each","Address SM deficits first"]},
      pain_impingement_sm:{
        label:"Pain During Movement (Clearing Test Positive)",
        meaning:"Shoulder pain during impingement clearing test — subacromial pathology present.",
        biomech:"Subacromial space compromised — inflammation, structural narrowing, or rotator cuff pathology causing pain with shoulder elevation + IR.",
        weak:["Rotator cuff all four","Lower trapezius","Serratus anterior"],
        tight:["Posterior capsule creating anterior-superior migration","Pec minor scapular depression"],
        kinetic:"Impingement → guarded movement → altered motor patterns → compensatory cervical and trunk strategies.",
        type:"Pathological — Score = 0",
        risk:"Rotator cuff tear progression, SLAP injury, AC joint degeneration. DO NOT load overhead without clearance.",
        compensation:"Arm held close, shoulder elevated, trunk rotation to reduce elevation demand.",
        treatment:["IMMEDIATE: Score = 0. Refer for shoulder assessment — imaging may be warranted","Conservative: posterior capsule stretch, lower trap activation, postural correction","Avoid aggravating overhead loading until pain-free","Address scapular dyskinesia and posture"],
        exercises:["Address pain first — no overhead loading","Postural correction exercises","Pendulum Codman's for acute relief","Posterior capsule gentle stretch pain-free range","Refer to physiotherapist or orthopaedic if not resolving"]}
    }
  },
  aslr:{
    label:"Active Straight Leg Raise", icon:"🦿",
    how:"Patient supine on firm surface. Arms flat at sides palms up. Raise one leg as high as possible, knee completely straight, opposite leg flat on floor. Measure raised leg height relative to midpoint between ASIS and knee of stationary leg. Both sides.",
    cues:["Keep raised knee fully straight","Raised foot dorsiflexed toe toward face","Opposite leg completely flat","Arms do not press into floor","Pelvis neutral — no tilt or rotation"],
    scoring:"3=Raised leg reaches between ASIS and vertical. 2=Between ASIS line and mid-thigh of opposite. 1=Below opposite knee. 0=Pain.",
    defects:{
      limited_hamstring_length:{
        label:"Limited Hamstring Length / Hip Flexion Range",
        meaning:"Inability to raise leg sufficiently — posterior chain tightness or sciatic neural tension limits active hip flexion.",
        biomech:"Hamstring tightness resists passive elongation during hip flexion. Hip flexors must overcome hamstring tension AND inertia — combined demand may exceed capacity.",
        weak:["Iliopsoas","Rectus femoris","TFL hip flexion component"],
        tight:["Biceps femoris long and short head","Semimembranosus","Semitendinosus","Posterior hip capsule","Sciatic nerve neural tension — differentiate with neurodynamics"],
        kinetic:"Posterior chain restriction → compensatory lumbar flexion → decreased lumbar stability → disc posterior migration.",
        type:"Mobility",
        risk:"Hamstring tear, proximal tendinopathy, lumbar disc herniation, sciatic nerve sensitisation.",
        compensation:"Pelvis posteriorly tilts, opposite knee flexes, or lumbar flattens to increase apparent range.",
        treatment:["Neural mob: SLR neural glide if neurogenic 2×10","Hamstring stretch: supine towel 3×45s, standing 3×45s","Active: lying leg raise 3×12, dead bug leg lowering 3×10","Eccentric: Nordic hamstring progressive loading","Differentiate neural tension vs muscle — Slump test"],
        exercises:["Supine hamstring stretch towel 3×45s","SLR neural glide 2×10 oscillations","Lying leg raise 3×12","Dead bug leg lowering 3×10","Nordic hamstring eccentric progressive","Standing hamstring stretch 3×45s"]},
      posterior_pelvic_tilt_aslr:{
        label:"Compensatory Posterior Pelvic Tilt",
        meaning:"Pelvis rotates posteriorly as leg rises — deep core cannot stabilise pelvis against hip flexor pull.",
        biomech:"TA and multifidus must create lumbar stiffness to resist extension moment created by leg raising. Weakness allows pelvis to rotate.",
        weak:["Transverse abdominis primary","Multifidus","Internal oblique","Pelvic floor"],
        tight:["Hamstrings contribute to pelvic tilt","Thoracolumbar fascia"],
        kinetic:"Pelvic tilt → lumbar flexion → posterior disc shear → hip flexor labral stress.",
        type:"Stability + Motor Control",
        risk:"Lumbar disc herniation, hip labral tear, SI joint dysfunction.",
        compensation:"Pelvis tilts to reduce hamstring tension — creates false impression of greater ROM.",
        treatment:["TA activation: drawing-in 3×10 10s holds","Dead bug with pelvic neutral 3×10 each","Pressure biofeedback lumbar support during ASLR","Bird-dog 3×10","ASLR with therapist hand under lumbar for feedback"],
        exercises:["TA drawing-in 3×10 10s holds","Dead bug neutral lumbar 3×10","Bird-dog 3×10","ASLR with pressure biofeedback 3×10","Supine heel slide neutral pelvis 3×10"]},
      opposite_leg_rise:{
        label:"Opposite Leg Lifts During Test",
        meaning:"Stationary leg flexes or lifts — bilateral posterior chain tightness pulling through pelvis.",
        biomech:"Severe bilateral hamstring tightness creates reciprocal tension through pelvis when one leg is raised, pulling opposite leg into slight flexion.",
        weak:["Bilateral hip flexors","Bilateral core stabilisers"],
        tight:["Bilateral hamstrings","Bilateral posterior chain gastroc, plantar fascia"],
        kinetic:"Bilateral restriction → reduced gait efficiency → lumbar overload bilaterally → increased disc stress.",
        type:"Mobility (Bilateral)",
        risk:"Bilateral hamstring tearing, lumbar disc herniation bilateral, reduced gait stride length.",
        compensation:"Opposite leg flexes allowing slight pelvic movement — chain reaction from bilateral tightness.",
        treatment:["Bilateral hamstring stretching 2 sessions/day","Neural mobilisation bilateral SLR glides","Yoga forward fold soft knee to straight progression","Address thoracolumbar fascia foam roll"],
        exercises:["Bilateral supine hamstring stretch 3×45s","SLR neural glide bilateral 2×10","Standing hamstring both 3×45s","Yoga forward fold progression 3×30s","Foam roll thoracolumbar 2min"]},
      pelvic_rotation_aslr:{
        label:"Pelvic Rotation During Raise",
        meaning:"Pelvis rotates as leg rises — hip rotator tightness or asymmetric core creating rotational pull.",
        biomech:"Hip ER tightness on tested side creates ER moment as hip flexes, causing pelvis to rotate away. Core cannot stabilise against rotational demand.",
        weak:["Anti-rotation core obliques TA","Hip IR muscles allow ER torque to dominate"],
        tight:["Hip external rotators piriformis obturators gemelli","Posterior hip capsule"],
        kinetic:"Pelvic rotation → SI joint torsion → asymmetric lumbar facet loading → disc torsion.",
        type:"Mobility + Motor Control",
        risk:"SI joint dysfunction, lumbar disc torsion, hip labral stress.",
        compensation:"Pelvis rotates to allow hip greater flexion without requiring IR — avoids posterior capsule stretch.",
        treatment:["Hip ER stretch: figure-4, pigeon pose 3×60s","SI joint stabilisation if hypermobile","Anti-rotation core: Pallof press 3×12","Motor control: ASLR with pelvic stabilisation cue"],
        exercises:["Pigeon pose 3×60s each","Figure-4 stretch 3×45s each","Pallof press 3×12 each direction","ASLR with pelvic control cue 3×10","Dead bug rotation control 3×10"]},
      raised_knee_flexion:{
        label:"Raised Knee Flexes During Test",
        meaning:"Raised leg knee bends — hamstring tightness inhibits full knee extension under hip flexion demand.",
        biomech:"Hamstrings cross both hip and knee. During hip flexion with knee extension, maximal two-joint length is demanded — flexibility limitation causes passive knee flexion.",
        weak:["Quadriceps must resist passive knee flexion","Hip flexors insufficient to maintain position"],
        tight:["Hamstrings all 3 heads primary","Proximal hamstring — ischial attachment tendinopathy consideration"],
        kinetic:"Knee flexion reduces hamstring stretch demand — system cheats by flexing knee.",
        type:"Mobility",
        risk:"Proximal hamstring tendinopathy, hamstring tear, reduced running economy.",
        compensation:"Knee flexion shortens hamstring demand — achieves apparent hip flexion at cost of pattern quality.",
        treatment:["Hamstring: supine towel stretch emphasise knee extension 3×45s","Neural mob: SLR ankle DF and knee extension emphasis","Seated hamstring: knee extension from 90° 3×45s","Eccentric Nordic hamstring for length and strength"],
        exercises:["Supine towel hamstring straight knee 3×45s","Seated knee extension stretch 3×45s","SLR neural glide knee ankle emphasis 2×10","Standing hamstring flat back hinge 3×45s","Nordic hamstring eccentric progressive"]},
      asymmetry_aslr:{
        label:"L/R Asymmetry in Raise Height",
        meaning:"Significant side-to-side difference — unilateral restriction from previous injury or sport adaptation.",
        biomech:"Unilateral hamstring restriction from previous strain or neural sensitisation creates asymmetric pattern.",
        weak:["Hip flexors restricted side"],
        tight:["Hamstrings restricted side","Sciatic nerve restricted side neural tension"],
        kinetic:"Asymmetry → asymmetric gait stride → ipsilateral hip overload → contralateral compensation.",
        type:"Mobility (Asymmetrical)",
        risk:"Recurrent hamstring strain restricted side, gait asymmetry, contralateral hip overload.",
        compensation:"Trunk leans or pelvis tilts to increase apparent range on restricted side.",
        treatment:["Priority: stretch restricted side only until symmetric","Slump test: rule out neural component","Unilateral hamstring program restricted side","Reassess every 4 weeks"],
        exercises:["Unilateral supine hamstring stretch restricted 3×45s","Unilateral SLR neural glide restricted 2×10","Unilateral Nordic restricted side 3×8","Progress bilateral only after symmetry","Y-balance posterior reach comparison"]}
    }
  },
  tspu:{
    label:"Trunk Stability Push-Up", icon:"🤸",
    how:"Prone position. Men: thumbs at forehead. Women: thumbs at chin. Perform ONE push-up rising as completely rigid plank. If unable: men try thumbs at chin, women at shoulder. CLEARING TEST: Prone press-up cobra — pain = score 0.",
    cues:["Body rises as one single rigid unit","No hip hike before or during push","No lumbar sag at any point","Head, thoracic, lumbar, hips, legs all move together","One push-up only — quality over repetition"],
    scoring:"3=Single push-up rigid appropriate level. 2=Lumbar sag or hip leads. 1=Cannot perform at level, can at regressed. 0=Pain.",
    defects:{
      lumbar_sag_tspu:{
        label:"Lumbar Sag / Anterior Lag",
        meaning:"Hips and lumbar drop and rise last — anterior core insufficient trunk rigidity for push-up force transfer.",
        biomech:"TA, multifidus and obliques must create IAP and lumbar stiffness to transfer force from chest through trunk to hips. Weakness creates wet-noodle pattern.",
        weak:["Transverse abdominis primary","Multifidus","Internal and external obliques","Rectus abdominis","Pelvic floor part of core canister"],
        tight:["Thoracolumbar fascia prevents TA full tensioning","Hip flexors pull lumbar into extension adding to sag"],
        kinetic:"Lumbar sag → L4-5 extension loading → posterior disc compression → facet approximation.",
        type:"Stability + Motor Control",
        risk:"Lumbar disc herniation extension type, facet arthropathy, SI joint stress.",
        compensation:"Hips sag and rise independently — caterpillar push-up pattern.",
        treatment:["Phase 1: TA activation drawing-in + bracing 3×10 10s","Phase 2: Plank 3×20s → 30s → 60s strict","Phase 3: Dead bug with TA brace 3×10","Phase 4: Push-up regression wall → incline → knee → full","Phase 5: Full push-up with dowel on back rigid body feedback"],
        exercises:["Plank 3×30s to 60s","Dead bug 3×10","Modified push-up knees rigid 3×10","TA drawing-in 3×10 10s","Full push-up rigid body cue 3×5"]},
      hip_hike_pike:{
        label:"Hip Hike / Piking",
        meaning:"Hips rise first before chest — posterior chain dominance avoiding anterior push-up demand.",
        biomech:"Hamstrings and glutes fire first instead of pectorals and anterior deltoids — pyramid/pike shape. CNS chooses familiar posterior chain pattern.",
        weak:["Pectoralis major","Anterior deltoid","Triceps","Serratus anterior","Anterior core"],
        tight:["Hamstrings","Posterior hip capsule","Gastrocnemius"],
        kinetic:"Hip hike → lumbar flexion moment → posterior disc loading — opposite of lumbar sag equally problematic.",
        type:"Motor Control",
        risk:"Lumbar disc posterior herniation, hamstring overuse, poor upper body push capacity.",
        compensation:"Posterior chain fires to initiate — avoids chest push demand by hinging at hips first.",
        treatment:["Motor control: simultaneous hands + feet press into ground","Regression: incline push-up rigid body timing","Chest + tricep: chest press 3×12, dips 3×10","Push-up timing drill: 3-count lower pause press","Plank to push-up transition practice"],
        exercises:["Incline push-up rigid 3×12","Wall push-up motor control 3×10","Chest press 3×12","Tricep push-down 3×15","Push-up timing drill 3×5"]},
      asymmetric_push_tspu:{
        label:"Asymmetric Push / Trunk Rotation",
        meaning:"Trunk rotates during push-up — unilateral pectoral or shoulder weakness creating rotational force.",
        biomech:"Asymmetric force from one pec/deltoid creates rotational moment — trunk rotates toward weaker side as stronger side pushes faster.",
        weak:["Pec major weaker side","Anterior deltoid weaker side","Serratus anterior weaker side","Triceps weaker side"],
        tight:["Pec minor dominant side over-pulls toward dominance"],
        kinetic:"Trunk rotation → asymmetric thoracic/cervical load → repeated rotational disc stress → contralateral shoulder compensation.",
        type:"Stability (Asymmetrical)",
        risk:"Cervical disc asymmetric stress, shoulder impingement dominant side, thoracic asymmetry.",
        compensation:"Dominant side pushes faster creating visible trunk rotation.",
        treatment:["Unilateral: single-arm chest press 3×12 weaker side emphasis","Single-arm plank 3×20s each","Push-up on unstable surface alternate hand Bosu","Stretch dominant pec minor","Equalise bilateral training volume"],
        exercises:["Single-arm chest press 3×12 each","Single-arm plank 3×20s each","Push-up alternating Bosu 3×8","Band pull-apart 3×15","Push-up symmetry cue mirror 3×8"]},
      head_drop_tspu:{
        label:"Head Drop / Cervical Compensation",
        meaning:"Head drops or juts forward during push-up — deep cervical flexor weakness.",
        biomech:"Longus colli and longus capitis must maintain craniovertebral neutral during push-up. Weakness allows head to drop with gravity.",
        weak:["Longus colli","Longus capitis","Deep cervical flexors","Lower trapezius"],
        tight:["Suboccipital extensors","Upper trapezius","SCM"],
        kinetic:"Head drop → cervical extension → suboccipital compression → headache risk → cervical disc stress.",
        type:"Motor Control + Stability",
        risk:"Cervicogenic headache, cervical facet irritation, suboccipital neuralgia.",
        compensation:"Head drops to reduce cervical flexor demand — trunk completes push-up without craniovertebral neutral.",
        treatment:["Chin tuck jowl exercise 3×10 5s holds","Suboccipital release manual or tennis ball 2min","Neck dissociation: maintain chin tuck during push-up","Scapular stability lower trap to reduce cervical chain overload"],
        exercises:["Chin tuck supine 3×10 5s holds","Suboccipital release 2min","Push-up chin tuck maintained 3×5","Deep neck flexor endurance practice","Lower trap Y-T-W 3×12"]},
      scapular_winging_tspu:{
        label:"Scapular Winging During Push-Up",
        meaning:"Medial scapular border wings — serratus anterior weakness under load.",
        biomech:"Serratus anterior generates protraction and upward rotation at top of push-up. Weakness allows medial border to wing, creating impingement and poor load transfer.",
        weak:["Serratus anterior primary","Lower trapezius","Middle trapezius"],
        tight:["Pec minor scapular depression and anterior tilting"],
        kinetic:"Scapular winging → GH instability → rotator cuff overload → impingement → cervical chain compensation.",
        type:"Stability + Motor Control",
        risk:"Subacromial impingement, rotator cuff overuse, cervical overload.",
        compensation:"Shoulder elevation and trunk tilt substitute — visible scapular lifting.",
        treatment:["Serratus: push-up plus extra protraction 3×15","Wall push-up plus 3×15","Serratus punch band 3×15","Pec minor stretch release scapular depression"],
        exercises:["Wall push-up plus 3×15","Push-up plus knees 3×12","Serratus punch 3×15","Pec minor corner stretch 3×30s","Bear crawl scapular stability 3×10m"]},
      elbow_flare_tspu:{
        label:"Excessive Elbow Flare (>45° From Trunk)",
        meaning:"Elbows abduct excessively — pec tightness or poor motor pattern creating shoulder impingement position.",
        biomech:"Elbow flare >45° places GH in maximal anterior impingement position. Indicates pec major dominance over triceps.",
        weak:["Triceps insufficient elbow extension","Serratus anterior"],
        tight:["Pec major pulls arms into horizontal abduction","Anterior shoulder capsule"],
        kinetic:"Elbow flare → anterior GH impingement → rotator cuff tension → potential SLAP stress.",
        type:"Motor Control + Mobility",
        risk:"Anterior shoulder impingement, SLAP tear, AC joint stress.",
        compensation:"Elbows flare to reduce pec stretch demand — engage pec major preferentially.",
        treatment:["Pec major stretch doorway 3×30s","Motor control: push-up with elbows at 45° cue","Tricep: diamond push-up, close-grip press","Kinesiology tape for elbow position cue"],
        exercises:["Pec major doorway stretch 3×30s","Close-grip push-up 45° elbow 3×10","Tricep push-down 3×15","Motor control push-up elbow cue mirror 3×10","Band pull-apart 3×15"]},
      pain_clearing_tspu:{
        label:"Pain on Clearing Test (Spinal Extension Pain)",
        meaning:"Pain with prone press-up — lumbar extension pathology present.",
        biomech:"Prone press-up creates lumbar extension moment — compresses posterior elements (facets) and reduces posterior disc space.",
        weak:["Anterior core weak allows excessive extension"],
        tight:["Thoracolumbar extensors","Hip flexors anteriorly tilt pelvis"],
        kinetic:"Extension pain → guarded posture → flexion-biased compensation → risk of flexion disc herniation.",
        type:"Pathological — Score = 0",
        risk:"Lumbar facet arthropathy, spondylolisthesis, extension-type disc herniation. DO NOT LOAD.",
        compensation:"Patient avoids extension entirely — flexion-biased posture develops.",
        treatment:["IMMEDIATE: Score = 0. Refer for lumbar assessment","Flexion-biased rehab: knee-to-chest, cat-cow flexion","Core stabilisation neutral/flexion position","Avoid extension exercises until cleared"],
        exercises:["Address pain first — no extension loading","Knee-to-chest stretch 3×30s","Cat-cow flexion emphasis 2×15","Supine core stabilisation neutral 3×10","Refer if persistent or radiating"]}
    }
  },
  rs:{
    label:"Rotary Stability", icon:"🔄",
    how:"Quadruped: hands under shoulders, knees under hips, spine neutral. Attempt 1: Extend ipsilateral (same side) arm + leg simultaneously, return. Attempt 2 if fails: Diagonal opposite arm + leg. Both sides. CLEARING TEST: Quadruped rocking child's pose — pain = score 0.",
    cues:["Spine completely neutral — no rotation, flexion or extension","Extend arm and leg together — no momentum","Keep pelvis level and still","Repeat both sides","Note: unilateral vs diagonal performance"],
    scoring:"3=Unilateral same-side without trunk rotation. 2=Diagonal opposite arm-leg without rotation. 1=Rotation present OR unable. 0=Pain.",
    defects:{
      trunk_rotation_rs:{
        label:"Trunk Rotation During Extension",
        meaning:"Spine rotates as arm or leg extends — deep core fails to resist rotational moment from limb extension.",
        biomech:"TA, multifidus, and diaphragm form core canister providing stiffness. Ipsilateral extension creates rotational moment — core failure allows trunk to rotate with limbs.",
        weak:["Transverse abdominis primary","Multifidus rotational stabiliser","Gluteus maximus ipsilateral","Deep hip stabilisers","Diaphragm coordination"],
        tight:["Thoracolumbar fascia limits TA tensioning","Hip flexors create anterior rotation"],
        kinetic:"Trunk rotation → asymmetric SI joint loading → lumbar facet asymmetric stress → poor athletic force transfer.",
        type:"Stability + Motor Control",
        risk:"SI joint dysfunction, lumbar disc torsion, poor sports performance force leaks at lumbopelvic junction.",
        compensation:"Trunk rotates with extending limbs — treats trunk and limb as single unit rather than dissociating.",
        treatment:["Phase 1: arm extension only no leg 3×10","Phase 2: leg extension only 3×10","Phase 3: combine slowly 3s hold 3×8","Phase 4: add resistance band on extending limb","Phase 5: book on back maintain level","Exhale to brace → then extend"],
        exercises:["Bird-dog arm only 3×10","Bird-dog leg only 3×10","Bird-dog combined slow 3s hold 3×8","Book on back quadruped hold 3×30s","Pallof press 3×12 each direction","Dead bug 3×10"]},
      hip_drop_rs:{
        label:"Hip Drop in Quadruped",
        meaning:"Hip drops on extending leg side — lateral hip stabiliser weakness in quadruped.",
        biomech:"Extending leg creates abduction moment — glute med must resist. Weakness allows pelvis to drop toward extending leg side.",
        weak:["Gluteus medius ipsilateral","Gluteus minimus","Deep hip stabilisers","QL contralateral"],
        tight:["Contralateral QL must lengthen to allow drop","Hip adductors ipsilateral"],
        kinetic:"Hip drop → pelvic obliquity → asymmetric L4-5 loading → SI joint rotation.",
        type:"Stability",
        risk:"SI joint dysfunction, asymmetric lumbar disc loading, hip abductor tendinopathy.",
        compensation:"Contralateral trunk lean reduces apparent hip drop — masking abductor weakness.",
        treatment:["Glute med: clamshell 3×20, side-lying abduction 3×15","Quadruped hip extension donkey kick level pelvis 3×15","Cue: keep hips level like a table-top","Palpate ASIS for symmetry during exercise"],
        exercises:["Clamshell 3×20","Side-lying hip abduction 3×15","Quadruped hip extension level 3×15","Single-leg bridge 3×12","Lateral band walk 3×12"]},
      spine_flexion_extension_rs:{
        label:"Lumbar Flexion or Extension During Movement",
        meaning:"Lumbar moves into flexion or extension instead of neutral — poor core control in quadruped.",
        biomech:"Hip flexors pull lumbar into extension OR abdominals allow flexion during limb extension. Both indicate failure to maintain neutral.",
        weak:["Multifidus limits extension","TA limits flexion","Gluteus maximus limits anterior pelvic tilt"],
        tight:["Hip flexors cause extension","Hamstrings cause flexion compensation"],
        kinetic:"Lumbar movement → increased disc and facet loading dynamically → cumulative injury risk.",
        type:"Stability + Motor Control",
        risk:"Lumbar disc herniation, facet degeneration, SI joint stress.",
        compensation:"Lumbar moves to allow limb range that trunk stability cannot support — spine subsidises for lack of control.",
        treatment:["Pelvic neutral awareness: anterior → neutral → posterior tilt drill","Bird-dog with therapist hand under lumbar feedback","Pressure biofeedback maintain pressure during bird-dog","Core stabilisation in 4-point before limb movement"],
        exercises:["Pelvic tilt awareness drill 3×10 each direction","Bird-dog with lumbar feedback 3×10","TA drawing-in bird-dog 3×10","Pressure biofeedback bird-dog 3×10","Dead bug mirror pattern 3×10"]},
      loss_of_balance_rs:{
        label:"Loss of Balance / Falls from Quadruped",
        meaning:"Cannot maintain quadruped stability during limb extension — severe proximal stability deficit.",
        biomech:"Quadruped balance requires integrated wrist, shoulder, trunk, and hip proprioception. Loss indicates multi-segmental failure.",
        weak:["Wrist shoulder stabilisers","Core globally","Hip stabilisers"],
        tight:["Not primarily a tightness issue"],
        kinetic:"Balance loss → inability to perform safe functional loading → high injury risk.",
        type:"Motor Control + Proprioception",
        risk:"Falls risk, inability to safely perform athletic movements, poor deceleration.",
        compensation:"Rapid limb replacement, trunk lean, wide hand/knee placement.",
        treatment:["Regress: quadruped hold no limb extension 3×30s","Bear crawl dynamic quadruped 3×10m","Wrist stability: wrist circles closed-chain","Progress very gradually — stable before extending limbs"],
        exercises:["Quadruped hold stable 3×30s","Bear crawl 3×10m","Wrist stability drills 3×10","Quadruped weight shifts 3×10","Single-limb extension only when stable 3×10"]},
      only_diagonal_rs:{
        label:"Can Only Perform Diagonal (Not Unilateral) — Grade 2",
        meaning:"Cannot extend same-side arm + leg but can do contralateral — incomplete proximal stability.",
        biomech:"Unilateral extension creates greater rotational moment than diagonal. Diagonal is biomechanically easier — contralateral extension creates counterbalancing moments.",
        weak:["Deep stabilisers multifidus TA","Ipsilateral glute max","Core canister generally"],
        tight:["None specifically — strength/control deficit"],
        kinetic:"Unilateral deficit → reliance on counter-rotation strategy — adequate for daily function, insufficient for sport.",
        type:"Motor Control",
        risk:"Moderate athletic performance limitation — insufficient for sport-specific demands.",
        compensation:"Uses diagonal as compensatory strategy — counterbalancing reduces rotational demand.",
        treatment:["Practice unilateral bird-dog same side emphasis","Progress: resistance band on extending arm and leg","Core advancement: plank, dead bug with load","Re-test monthly — expect 6-8 weeks to achieve unilateral"],
        exercises:["Bird-dog ipsilateral emphasis 3×10 each","Ipsilateral bird-dog 2s hold 3×8","Pallof press anti-rotation 3×12","Dead bug challenging 3×10","Plank alternate leg lift 3×10 each"]},
      asymmetry_rs:{
        label:"Left-Right Asymmetry",
        meaning:"Performance differs between sides — unilateral stability or mobility deficit from previous injury or compensation.",
        biomech:"Asymmetric motor control from CNS adaptation to previous injury or dominant side overuse creates side-to-side difference.",
        weak:["Deep stabilisers weaker side","Glute max/med affected side"],
        tight:["Hip rotators affected side create rotational pull"],
        kinetic:"Asymmetry → asymmetric athletic load → overuse injury restricted side — key injury predictor.",
        type:"Motor Control (Asymmetrical)",
        risk:"High injury risk restricted side — asymmetry strongest predictor of future musculoskeletal injury.",
        compensation:"Stronger side used preferentially — restricted side avoids demand.",
        treatment:["Emphasise weaker side all exercises","Single-limb core exercises restricted side","Document and track progress every 4 weeks","Sport-specific loading after symmetry achieved"],
        exercises:["Bird-dog restricted side emphasis 3×10","Single-leg bridge restricted 3×12","Pallof press restricted side lead 3×12","Unilateral dead bug 3×10 restricted","Re-assess monthly track asymmetry"]},
      pain_clearing_rs:{
        label:"Pain on Clearing Test (Quadruped Rocking)",
        meaning:"Pain during quadruped rocking / child's pose — lumbar flexion or hip pathology limiting safe testing.",
        biomech:"Quadruped rocking loads hip flexion and lumbar flexion simultaneously. Pain indicates hip FAI, labral issue, lumbar flexion sensitivity, or SI joint dysfunction.",
        weak:["Not a weakness issue — pathological limitation"],
        tight:["Posterior hip capsule hip pain","Thoracolumbar fascia lumbar pain"],
        kinetic:"Pain → guarded movement → global co-contraction → further stiffness and restriction.",
        type:"Pathological — Score = 0",
        risk:"Hip FAI/labral tear, lumbar disc herniation flexion type, SI joint dysfunction. DO NOT LOAD.",
        compensation:"Hip pain avoidance → posterior lean → lumbar hyperextension substitute.",
        treatment:["IMMEDIATE: Score = 0. Refer for assessment — imaging if indicated","Differentiate: hip vs lumbar origin of pain","Address FAI conservatively or refer surgically","Lumbar: McKenzie assessment directional preference"],
        exercises:["Address pain first — no quadruped loading","Hip: gentle AROM pain-free range","Lumbar: directional preference McKenzie","Refer if not resolving","Water-based therapy if too painful for land"]}
    }
  }
};

// ── FMS_STORAGE_KEY2 ──
const FMS_STORAGE_KEY2="fms_clinical_v1";
function loadFMSReport(){try{return JSON.parse(localStorage.getItem(FMS_STORAGE_KEY2)||"{}");}catch{return{};}}
function saveFMSReport(r){try{localStorage.setItem(FMS_STORAGE_KEY2,JSON.stringify(r));}catch{}}

function FMASection(){
  const [selectedTests,setSelectedTests]=useState(()=>{
    const saved=loadFMSReport();
    return Object.keys(saved).length>0?Object.keys(saved):[];
  });
  const [report,setReport]=useState(()=>loadFMSReport());
  const [activeTest,setActiveTest]=useState(null);
  const [scores,setScores]=useState(()=>{
    const saved=loadFMSReport();
    const s={};
    Object.entries(saved).forEach(([k,v])=>{if(v.score!==undefined)s[k]=v.score;});
    return s;
  });
  const [showCamera,setShowCamera]=useState(false);
  const [expandedDef,setExpandedDef]=useState(null);
  const [activeSection,setActiveSection]=useState("select"); // select | test | report

  function toggleTest(id){
    setSelectedTests(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      return next;
    });
    if(!selectedTests.includes(id)&&!activeTest) setActiveTest(id);
  }

  function getTestDefects(testId){
    return report[testId]?.defects||[];
  }

  function toggleDefect(testId,defId){
    setReport(prev=>{
      const cur=prev[testId]?.defects||[];
      const next=cur.includes(defId)?cur.filter(x=>x!==defId):[...cur,defId];
      const updated={...prev,[testId]:{...(prev[testId]||{}),defects:next}};
      saveFMSReport(updated);
      return updated;
    });
  }

  function setScore(testId,score){
    setScores(p=>({...p,[testId]:score}));
    setReport(prev=>{
      const updated={...prev,[testId]:{...(prev[testId]||{}),score}};
      saveFMSReport(updated);
      return updated;
    });
  }

  function clearAll(){
    setSelectedTests([]); setReport({}); setScores({}); setActiveTest(null);
    localStorage.removeItem(FMS_STORAGE_KEY2);
  }

  const totalDefects=Object.values(report).reduce((s,t)=>s+(t.defects?.length||0),0);
  const sc2col=(s)=>s>=3?C.green:s===2?C.yellow:s===1?C.red:C.muted;
  const totalScore=Object.entries(scores).reduce((s,[,v])=>s+(v??0),0);
  const maxScore=selectedTests.length*3;

  return(
    <div>
      {/* Header */}
      <div style={{background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.2)",borderRadius:12,padding:12,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div>
            <div style={{fontWeight:800,color:C.accent,marginBottom:3}}>🏃 FMS — Clinical Reasoning Assistant</div>
            <div style={{fontSize:"0.75rem",color:C.muted}}>Select tests, identify defects manually. AI camera optional. Full clinical interpretation generated per defect.</div>
          </div>
          <button type="button" onClick={()=>setShowCamera(p=>!p)} style={{flexShrink:0,padding:"5px 10px",background:showCamera?"rgba(0,229,255,0.15)":"rgba(0,229,255,0.06)",border:`1px solid ${showCamera?C.accent:C.border}`,borderRadius:8,color:showCamera?C.accent:C.muted,fontSize:"0.7rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
            📷 AI Camera {showCamera?"ON":"OFF"}
          </button>
        </div>
        {selectedTests.length>0&&(
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{fontSize:"0.7rem",color:C.muted}}>{selectedTests.length} test{selectedTests.length!==1?"s":""} selected · {totalDefects} defect{totalDefects!==1?"s":""} identified</div>
            {selectedTests.length>0&&maxScore>0&&<div style={{fontSize:"0.7rem",color:C.accent,fontWeight:700}}>Score: {totalScore}/{maxScore}</div>}
            <button type="button" onClick={clearAll} style={{marginLeft:"auto",padding:"2px 8px",background:"transparent",border:`1px solid ${C.red}40`,borderRadius:6,color:C.red,fontSize:"0.65rem",cursor:"pointer"}}>Clear All</button>
          </div>
        )}
      </div>

      {/* Optional AI Camera */}
      {showCamera&&<FMSCameraPanel onClose={()=>setShowCamera(false)}/>}

      {/* Tab nav */}
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {[["select","🗂 Select Tests"],["test","🔍 Assess"],["report","📋 Report"]].map(([k,l])=>(
          <button key={k} type="button" onClick={()=>setActiveSection(k)}
            style={{flex:1,padding:"8px 4px",borderRadius:9,border:`1px solid ${activeSection===k?C.accent:C.border}`,background:activeSection===k?"rgba(0,229,255,0.1)":"transparent",color:activeSection===k?C.accent:C.muted,fontSize:"0.75rem",fontWeight:activeSection===k?700:500,cursor:"pointer"}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── SELECT TESTS VIEW ── */}
      {activeSection==="select"&&(
        <div>
          <div style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>Select Any Test(s)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:7}}>
            {Object.entries(FMS_DB).map(([id,test])=>{
              const sel=selectedTests.includes(id);
              const defCount=getTestDefects(id).length;
              const score=scores[id];
              return(
                <div key={id} onClick={()=>toggleTest(id)}
                  style={{padding:"11px 12px",borderRadius:10,border:`2px solid ${sel?C.accent:C.border}`,background:sel?"rgba(0,229,255,0.08)":C.s2,cursor:"pointer",transition:"all 0.15s",position:"relative"}}>
                  {sel&&<div style={{position:"absolute",top:6,right:8,width:16,height:16,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#000",fontSize:"0.6rem",fontWeight:900}}>✓</span></div>}
                  <div style={{fontSize:"1.4rem",marginBottom:4}}>{test.icon}</div>
                  <div style={{fontSize:"0.78rem",fontWeight:700,color:sel?C.accent:C.text,marginBottom:3}}>{test.label}</div>
                  {sel&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {score!==undefined&&<span style={{fontSize:"0.6rem",padding:"1px 5px",borderRadius:5,background:`${sc2col(score)}20`,color:sc2col(score),fontWeight:700}}>Score {score}</span>}
                    {defCount>0&&<span style={{fontSize:"0.6rem",padding:"1px 5px",borderRadius:5,background:"rgba(255,77,109,0.15)",color:C.red,fontWeight:700}}>⚠{defCount}</span>}
                  </div>}
                  {!sel&&<div style={{fontSize:"0.65rem",color:C.muted}}>Tap to add</div>}
                </div>
              );
            })}
          </div>
          {selectedTests.length>0&&(
            <button type="button" onClick={()=>setActiveSection("test")} style={{width:"100%",marginTop:12,padding:"11px",background:`linear-gradient(135deg,${C.accent},${C.a2})`,border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:"0.88rem"}}>
              Assess Selected Tests →
            </button>
          )}
        </div>
      )}

      {/* ── ASSESS VIEW ── */}
      {activeSection==="test"&&(
        <div>
          {selectedTests.length===0&&(
            <div style={{textAlign:"center",padding:"30px 20px",color:C.muted,background:C.s2,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:"2rem",marginBottom:8}}>🗂</div>
              <div style={{fontWeight:700,color:C.text,marginBottom:4}}>No tests selected</div>
              <button type="button" onClick={()=>setActiveSection("select")} style={{padding:"7px 16px",background:`rgba(0,229,255,0.1)`,border:`1px solid ${C.accent}`,borderRadius:8,color:C.accent,cursor:"pointer",fontSize:"0.8rem"}}>Select Tests</button>
            </div>
          )}

          {/* Test tabs */}
          {selectedTests.length>0&&(
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
              {selectedTests.map(id=>{
                const test=FMS_DB[id];
                const defCount=getTestDefects(id).length;
                const isActive=activeTest===id;
                return(
                  <button key={id} type="button" onClick={()=>setActiveTest(id)}
                    style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${isActive?C.accent:defCount>0?C.red+"60":C.border}`,background:isActive?"rgba(0,229,255,0.12)":defCount>0?"rgba(255,77,109,0.07)":"transparent",color:isActive?C.accent:defCount>0?C.red:C.muted,fontSize:"0.75rem",fontWeight:isActive?700:500,cursor:"pointer"}}>
                    {test.icon} {test.label}
                    {defCount>0&&<span style={{marginLeft:4,background:C.red,color:"#fff",borderRadius:8,padding:"0 5px",fontSize:"0.6rem",fontWeight:700}}>{defCount}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {activeTest&&FMS_DB[activeTest]&&(()=>{
            const test=FMS_DB[activeTest];
            const selectedDefs=getTestDefects(activeTest);
            return(
              <div>
                {/* Test info */}
                <div style={{background:C.surface,border:`1px solid ${C.accent}25`,borderRadius:12,padding:13,marginBottom:10}}>
                  <div style={{fontSize:"1.4rem",marginBottom:4}}>{test.icon}</div>
                  <div style={{fontWeight:800,color:C.text,fontSize:"1rem",marginBottom:6}}>{test.label}</div>

                  {/* How to perform */}
                  <div style={{background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:9,padding:"9px 11px",marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>📋 How to Perform</div>
                    <div style={{fontSize:"0.78rem",color:C.text,lineHeight:1.6}}>{test.how}</div>
                  </div>

                  {/* Cues */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:5,marginBottom:8}}>
                    {test.cues.map((c,i)=>(
                      <div key={i} style={{background:"rgba(0,229,255,0.04)",border:"1px solid rgba(0,229,255,0.12)",borderRadius:7,padding:"6px 9px",fontSize:"0.72rem",color:C.text}}>
                        <span style={{color:C.accent,fontWeight:700,marginRight:4}}>{i+1}.</span>{c}
                      </div>
                    ))}
                  </div>

                  {/* Scoring guide */}
                  <div style={{background:"rgba(127,90,240,0.06)",border:"1px solid rgba(127,90,240,0.2)",borderRadius:8,padding:"7px 10px",marginBottom:8}}>
                    <div style={{fontSize:"0.6rem",fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>📊 Scoring Guide</div>
                    <div style={{fontSize:"0.72rem",color:C.text,lineHeight:1.6}}>{test.scoring}</div>
                  </div>

                  {/* Score input */}
                  <div>
                    <div style={{fontSize:"0.65rem",color:C.muted,marginBottom:5,fontWeight:600}}>SCORE THIS TEST</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
                      {[0,1,2,3].map(s=>(
                        <button key={s} type="button" onClick={()=>setScore(activeTest,s)}
                          style={{padding:"9px 4px",borderRadius:8,border:`2px solid ${scores[activeTest]===s?sc2col(s):C.border}`,background:scores[activeTest]===s?`${sc2col(s)}20`:"transparent",color:sc2col(s),fontWeight:700,cursor:"pointer",fontSize:"0.85rem"}}>
                          {s}
                          <div style={{fontSize:"0.52rem",color:C.muted,fontWeight:400,marginTop:1}}>{s===0?"Pain":s===1?"Unable":s===2?"Compen.":"Normal"}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Defect selection */}
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:8}}>⚠ Select Observed Defects</div>
                  <div style={{display:"grid",gap:6}}>
                    {Object.entries(test.defects).map(([defId,def])=>{
                      const sel=selectedDefs.includes(defId);
                      const isExp=expandedDef===`${activeTest}_${defId}`;
                      return(
                        <div key={defId} style={{borderRadius:10,border:`1px solid ${sel?C.yellow:C.border}`,background:sel?"rgba(255,179,0,0.05)":C.surface,overflow:"hidden"}}>
                          {/* Defect header */}
                          <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",cursor:"pointer"}}
                            onClick={()=>toggleDefect(activeTest,defId)}>
                            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${sel?C.yellow:C.border}`,background:sel?C.yellow:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {sel&&<span style={{color:"#000",fontSize:"0.65rem",fontWeight:900}}>✓</span>}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:"0.8rem",fontWeight:sel?700:500,color:sel?C.yellow:C.text}}>{def.label}</div>
                              <div style={{fontSize:"0.65rem",color:C.muted,marginTop:1}}>{def.type}</div>
                            </div>
                            <button type="button"
                              onClick={e=>{e.stopPropagation();setExpandedDef(isExp?null:`${activeTest}_${defId}`);}}
                              style={{flexShrink:0,padding:"3px 8px",background:"rgba(127,90,240,0.12)",border:`1px solid ${C.a2}30`,borderRadius:6,color:C.a2,fontSize:"0.62rem",cursor:"pointer",fontWeight:700}}>
                              {isExp?"▲ Hide":"▼ Detail"}
                            </button>
                          </div>

                          {/* Expanded clinical detail */}
                          {isExp&&(
                            <div style={{padding:"0 12px 12px",borderTop:`1px solid ${C.border}`}}>
                              {/* Meaning */}
                              <div style={{background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:8,padding:"8px 10px",margin:"8px 0"}}>
                                <div style={{fontSize:"0.6rem",fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>🔍 Clinical Meaning</div>
                                <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{def.meaning}</div>
                              </div>
                              {/* Biomech */}
                              <div style={{background:"rgba(127,90,240,0.06)",border:"1px solid rgba(127,90,240,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                                <div style={{fontSize:"0.6rem",fontWeight:700,color:C.purple,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>⚙️ Biomechanical Reason</div>
                                <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{def.biomech}</div>
                              </div>
                              {/* Muscles */}
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                                <div style={{background:"rgba(255,77,109,0.07)",border:"1px solid rgba(255,77,109,0.2)",borderRadius:8,padding:"8px 10px"}}>
                                  <div style={{fontSize:"0.58rem",fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>🟡 Weak / Underactive</div>
                                  {def.weak.map((m,i)=><div key={i} style={{fontSize:"0.72rem",color:C.text,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>• {m}</div>)}
                                </div>
                                <div style={{background:"rgba(255,179,0,0.07)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:8,padding:"8px 10px"}}>
                                  <div style={{fontSize:"0.58rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>🔴 Tight / Overactive</div>
                                  {def.tight.map((m,i)=><div key={i} style={{fontSize:"0.72rem",color:C.text,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>• {m}</div>)}
                                </div>
                              </div>
                              {/* Kinetic chain */}
                              <div style={{background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                                <div style={{fontSize:"0.6rem",fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>⛓️ Kinetic Chain</div>
                                <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{def.kinetic}</div>
                              </div>
                              {/* Compensation */}
                              <div style={{background:"rgba(255,179,0,0.06)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                                <div style={{fontSize:"0.6rem",fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:"1px",marginBottom:3}}>🔄 Compensation Pattern</div>
                                <div style={{fontSize:"0.76rem",color:C.text,lineHeight:1.6}}>{def.compensation}</div>
                              </div>
                              {/* Treatment */}
                              <div style={{background:"rgba(0,201,122,0.06)",border:"1px solid rgba(0,201,122,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                                <div style={{fontSize:"0.6rem",fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>🩺 Treatment Strategy</div>
                                {def.treatment.map((t,i)=>(
                                  <div key={i} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                                    <span style={{color:C.green,fontWeight:700,flexShrink:0,fontSize:"0.7rem"}}>{i+1}.</span>
                                    <span style={{fontSize:"0.74rem",color:C.text,lineHeight:1.5}}>{t}</span>
                                  </div>
                                ))}
                              </div>
                              {/* Exercises */}
                              <div style={{background:"rgba(0,201,122,0.04)",border:"1px solid rgba(0,201,122,0.15)",borderRadius:8,padding:"8px 10px"}}>
                                <div style={{fontSize:"0.6rem",fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>💪 Corrective Exercises</div>
                                {def.exercises.map((ex,i)=>(
                                  <div key={i} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                                    <span style={{color:C.a3,fontWeight:700,flexShrink:0,fontSize:"0.7rem"}}>{i+1}.</span>
                                    <span style={{fontSize:"0.74rem",color:C.text,lineHeight:1.5}}>{ex}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── REPORT VIEW ── */}
      {activeSection==="report"&&(
        <div>
          {Object.keys(report).length===0||Object.values(report).every(t=>!t.defects?.length)?(
            <div style={{textAlign:"center",padding:"30px 20px",color:C.muted,background:C.s2,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:"2rem",marginBottom:8}}>📋</div>
              <div style={{fontWeight:700,color:C.text,marginBottom:4}}>No defects recorded yet</div>
              <div style={{fontSize:"0.78rem",marginBottom:12}}>Select tests and identify defects to generate a clinical report</div>
              <button type="button" onClick={()=>setActiveSection("test")} style={{padding:"7px 16px",background:`rgba(0,229,255,0.1)`,border:`1px solid ${C.accent}`,borderRadius:8,color:C.accent,cursor:"pointer",fontSize:"0.8rem"}}>Go to Assessment →</button>
            </div>
          ):(
            <div>
              {/* Summary header */}
              <div style={{background:C.surface,border:`1px solid ${C.accent}30`,borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontWeight:800,color:C.accent}}>Clinical Report Summary</div>
                  <button type="button" onClick={()=>generateFMSReportPDF(report)} style={{padding:"6px 12px",background:`linear-gradient(135deg,${C.accent},${C.a2})`,border:"none",borderRadius:8,color:"#000",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>📄 Export PDF</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
                  {selectedTests.filter(id=>report[id]).map(id=>{
                    const test=FMS_DB[id], sc=scores[id], defs=getTestDefects(id);
                    return(
                      <div key={id} style={{background:C.s2,border:`1px solid ${defs.length>0?C.yellow:C.border}`,borderRadius:9,padding:"9px 11px"}}>
                        <div style={{fontSize:"1rem",marginBottom:3}}>{test.icon}</div>
                        <div style={{fontSize:"0.72rem",fontWeight:700,color:C.text,marginBottom:2}}>{test.label}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {sc!==undefined&&<span style={{fontSize:"0.6rem",padding:"1px 5px",borderRadius:4,background:`${sc2col(sc)}15`,color:sc2col(sc),fontWeight:700}}>{sc}/3</span>}
                          {defs.length>0&&<span style={{fontSize:"0.6rem",padding:"1px 5px",borderRadius:4,background:"rgba(255,179,0,0.15)",color:C.yellow,fontWeight:700}}>⚠{defs.length}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-defect clinical breakdown */}
              {selectedTests.map(testId=>{
                const test=FMS_DB[testId];
                const defs=getTestDefects(testId);
                if(!defs.length) return null;
                return(
                  <div key={testId} style={{marginBottom:14}}>
                    <div style={{fontSize:"0.65rem",fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:7}}>
                      {test.icon} {test.label} {scores[testId]!==undefined&&`— Score ${scores[testId]}/3`}
                    </div>
                    {defs.map(defId=>{
                      const def=test.defects[defId]; if(!def) return null;
                      return(
                        <div key={defId} style={{background:C.surface,border:`1px solid ${C.yellow}30`,borderRadius:11,padding:14,marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                            <div style={{fontWeight:700,color:C.yellow,fontSize:"0.85rem"}}>⚠ {def.label}</div>
                            <span style={{padding:"2px 8px",borderRadius:8,background:`rgba(127,90,240,0.15)`,color:C.purple,fontSize:"0.62rem",fontWeight:700}}>{def.type}</span>
                          </div>

                          <div style={{fontSize:"0.75rem",color:C.text,lineHeight:1.6,marginBottom:8,padding:"7px 10px",background:"rgba(0,229,255,0.04)",borderRadius:7,borderLeft:`3px solid ${C.accent}`}}>{def.meaning}</div>

                          <div style={{fontSize:"0.65rem",fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>Biomechanical Mechanism</div>
                          <div style={{fontSize:"0.74rem",color:C.text,lineHeight:1.6,marginBottom:8}}>{def.biomech}</div>

                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                            <div style={{background:"rgba(255,77,109,0.07)",border:"1px solid rgba(255,77,109,0.2)",borderRadius:7,padding:"7px 9px"}}>
                              <div style={{fontSize:"0.58rem",fontWeight:700,color:C.red,marginBottom:4}}>🟡 WEAK / UNDERACTIVE</div>
                              {def.weak.map((m,i)=><div key={i} style={{fontSize:"0.71rem",color:C.text,padding:"2px 0"}}>• {m}</div>)}
                            </div>
                            <div style={{background:"rgba(255,179,0,0.07)",border:"1px solid rgba(255,179,0,0.2)",borderRadius:7,padding:"7px 9px"}}>
                              <div style={{fontSize:"0.58rem",fontWeight:700,color:C.yellow,marginBottom:4}}>🔴 TIGHT / OVERACTIVE</div>
                              {def.tight.map((m,i)=><div key={i} style={{fontSize:"0.71rem",color:C.text,padding:"2px 0"}}>• {m}</div>)}
                            </div>
                          </div>

                          <div style={{background:"rgba(0,229,255,0.05)",border:"1px solid rgba(0,229,255,0.15)",borderRadius:7,padding:"7px 9px",marginBottom:8}}>
                            <div style={{fontSize:"0.58rem",fontWeight:700,color:C.accent,marginBottom:3}}>⛓️ KINETIC CHAIN</div>
                            <div style={{fontSize:"0.73rem",color:C.text,lineHeight:1.6}}>{def.kinetic}</div>
                          </div>

                          <div style={{background:"rgba(0,201,122,0.05)",border:"1px solid rgba(0,201,122,0.18)",borderRadius:7,padding:"7px 9px"}}>
                            <div style={{fontSize:"0.58rem",fontWeight:700,color:C.green,marginBottom:5}}>💪 CORRECTIVE EXERCISES</div>
                            {def.exercises.map((ex,i)=>(
                              <div key={i} style={{display:"flex",gap:6,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                                <span style={{color:C.green,fontWeight:700,flexShrink:0,fontSize:"0.68rem"}}>{i+1}.</span>
                                <span style={{fontSize:"0.72rem",color:C.text,lineHeight:1.5}}>{ex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── OUTCOME_DB ──
const OUTCOME_DB = {
  // ── PAIN ────────────────────────────────────────────────────────────────────
  nrs: {
    id:"nrs", label:"NRS — Numerical Rating Scale", icon:"🔢", category:"Pain",
    description:"0–10 numeric pain rating. MCID = 2 points. Widely used, quick, valid for all musculoskeletal conditions.",
    fields:[
      {id:"nrs_rest",   label:"Pain at REST",     type:"slider", min:0, max:10, step:1},
      {id:"nrs_active", label:"Pain with MOVEMENT",type:"slider", min:0, max:10, step:1},
      {id:"nrs_worst",  label:"WORST pain (24h)",  type:"slider", min:0, max:10, step:1},
      {id:"nrs_best",   label:"BEST pain (24h)",   type:"slider", min:0, max:10, step:1},
    ],
    score:(v)=>{
      const vals=[v.nrs_rest,v.nrs_active,v.nrs_worst,v.nrs_best].filter(x=>x!==undefined&&x!=="");
      if(!vals.length) return null;
      return Math.round(vals.reduce((a,b)=>a+ +b,0)/vals.length*10)/10;
    },
    maxScore:10,
    interpret:(s)=> s<=3?{label:"Mild",color:"#00c97a",text:"Mild pain — may not limit function significantly. Monitor and reassess."}
      :s<=6?{label:"Moderate",color:"#ffb300",text:"Moderate pain — likely affecting daily activities. Active treatment indicated."}
      :{label:"Severe",color:"#ff4d6d",text:"Severe pain — significant functional limitation. Prioritise pain management."},
    mcid:2, unit:"/10",
  },

  vas: {
    id:"vas", label:"VAS — Visual Analogue Scale", icon:"📏", category:"Pain",
    description:"100mm line from 'no pain' to 'worst imaginable pain'. MCID = 15mm. More sensitive than NRS for detecting small changes.",
    fields:[
      {id:"vas_current", label:"Current pain (0–100mm)", type:"slider", min:0, max:100, step:1},
      {id:"vas_average", label:"Average pain past week (0–100mm)", type:"slider", min:0, max:100, step:1},
    ],
    score:(v)=> v.vas_current!==undefined&&v.vas_current!==""? +v.vas_current : null,
    maxScore:100,
    interpret:(s)=> s<=30?{label:"Mild",color:"#00c97a",text:"Mild pain (≤30mm). Monitor — reassess at 4 weeks."}
      :s<=60?{label:"Moderate",color:"#ffb300",text:"Moderate pain (31–60mm). Active treatment required."}
      :{label:"Severe",color:"#ff4d6d",text:"Severe pain (>60mm). Aggressive pain management strategy needed."},
    mcid:15, unit:"mm",
  },

  psfs: {
    id:"psfs", label:"PSFS — Patient Specific Functional Scale", icon:"🎯", category:"Function",
    description:"Patient identifies 3 most important activities they cannot perform or have difficulty with. Scored 0–10 each. MCID = 2 points average. Excellent for tracking individual goals.",
    fields:[
      {id:"psfs_act1",   label:"Activity 1 (describe)", type:"text",   placeholder:"e.g. Walking up stairs"},
      {id:"psfs_score1", label:"Activity 1 score",      type:"slider", min:0, max:10, step:1},
      {id:"psfs_act2",   label:"Activity 2 (describe)", type:"text",   placeholder:"e.g. Sitting >30 min"},
      {id:"psfs_score2", label:"Activity 2 score",      type:"slider", min:0, max:10, step:1},
      {id:"psfs_act3",   label:"Activity 3 (describe)", type:"text",   placeholder:"e.g. Returning to running"},
      {id:"psfs_score3", label:"Activity 3 score",      type:"slider", min:0, max:10, step:1},
    ],
    score:(v)=>{
      const scores=[v.psfs_score1,v.psfs_score2,v.psfs_score3].filter(x=>x!==undefined&&x!=="");
      if(!scores.length) return null;
      return Math.round(scores.reduce((a,b)=>a+ +b,0)/scores.length*10)/10;
    },
    maxScore:10,
    interpret:(s)=> s>=7?{label:"Good function",color:"#00c97a",text:"Good self-reported function on selected activities. Reassess goals."}
      :s>=4?{label:"Moderate limitation",color:"#ffb300",text:"Moderate limitation on patient-priority activities. Goal-directed treatment."}
      :{label:"Severe limitation",color:"#ff4d6d",text:"Severe limitation. Focus treatment on patient's priority functional goals."},
    mcid:2, unit:"/10 avg",
  },

  // ── SPINE ───────────────────────────────────────────────────────────────────
  odi: {
    id:"odi", label:"ODI — Oswestry Disability Index", icon:"🦴", category:"Spine — Lumbar",
    description:"10 sections, each scored 0–5. Total expressed as %. Gold standard for low back disability. MCID = 10%.",
    fields:[
      {id:"odi_pain",      label:"1. Pain intensity",        type:"select", options:["0 — No pain","1 — Very mild","2 — Moderate","3 — Fairly severe","4 — Very severe","5 — Worst imaginable"]},
      {id:"odi_personal",  label:"2. Personal care (washing/dressing)",type:"select",options:["0 — Normal, no extra pain","1 — Normal but painful","2 — Slow and careful","3 — Need some help","4 — Need help every day","5 — Unable to dress, painful to wash"]},
      {id:"odi_lifting",   label:"3. Lifting",               type:"select", options:["0 — Heavy without extra pain","1 — Heavy but extra pain","2 — Unable to lift floor but OK table","3 — Unable to lift heavy floor, light if positioned","4 — Can lift only very light","5 — Cannot lift at all"]},
      {id:"odi_walking",   label:"4. Walking",               type:"select", options:["0 — No limitation","1 — Pain <1 mile","2 — Pain <0.5 mile","3 — Pain <100m","4 — Only with stick/crutches","5 — Mostly in bed"]},
      {id:"odi_sitting",   label:"5. Sitting",               type:"select", options:["0 — Any chair as long as I like","1 — Favourite chair only as long as I like","2 — >1 hour","3 — >30 min","4 — >10 min","5 — Cannot sit at all"]},
      {id:"odi_standing",  label:"6. Standing",              type:"select", options:["0 — As long as I like","1 — >1 hour","2 — >30 min","3 — >10 min","4 — With extra pain","5 — Cannot stand"]},
      {id:"odi_sleeping",  label:"7. Sleeping",              type:"select", options:["0 — No problem","1 — Occasional disturbance due to pain","2 — <6 hours due to pain","3 — <4 hours due to pain","4 — <2 hours due to pain","5 — Cannot sleep"]},
      {id:"odi_sex",       label:"8. Sex life (if applicable)",type:"select",options:["0 — Normal, no extra pain","1 — Normal but painful","2 — Nearly normal, very painful","3 — Severely restricted by pain","4 — Nearly absent by pain","5 — N/A"]},
      {id:"odi_social",    label:"9. Social life",           type:"select", options:["0 — Normal, no extra pain","1 — Normal but extra pain","2 — No significant effect except energetic activities","3 — Restricted and home-based","4 — No social life due to pain","5 — No social life, pain everywhere"]},
      {id:"odi_travel",    label:"10. Travelling",           type:"select", options:["0 — Anywhere, no extra pain","1 — Anywhere but extra pain","2 — >2 hours but extra pain","3 — <1 hour due to pain","4 — <30 min due to pain","5 — Only to doctor/hospital"]},
    ],
    score:(v)=>{
      const ids=["odi_pain","odi_personal","odi_lifting","odi_walking","odi_sitting","odi_standing","odi_sleeping","odi_sex","odi_social","odi_travel"];
      const scores=ids.map(id=>v[id]? +v[id].split(" — ")[0] : null).filter(x=>x!==null);
      if(!scores.length) return null;
      return Math.round(scores.reduce((a,b)=>a+b,0)/(scores.length*5)*100);
    },
    maxScore:100,
    interpret:(s)=> s<=20?{label:"Minimal disability",color:"#00c97a",text:"0–20%: Minimal disability. Patient can manage most activities. Advice on lifting/posture."}
      :s<=40?{label:"Moderate disability",color:"#22d3ee",text:"21–40%: Moderate disability. Pain interferes with sitting, lifting, standing. Conservative management."}
      :s<=60?{label:"Severe disability",color:"#ffb300",text:"41–60%: Severe disability. Pain main problem. Detailed investigation and active treatment."}
      :s<=80?{label:"Crippling",color:"#ff8c00",text:"61–80%: Crippling back pain. Affects all aspects of life. MDT approach."}
      :{label:"Bed-bound",color:"#ff4d6d",text:"81–100%: Bed-bound or exaggerated symptoms. Psychosocial factors likely. Urgent review."},
    mcid:10, unit:"%",
  },

  ndi: {
    id:"ndi", label:"NDI — Neck Disability Index", icon:"🔄", category:"Spine — Cervical",
    description:"10 sections scored 0–5. Total as %. Gold standard for cervical spine disability. MCID = 7.5%.",
    fields:[
      {id:"ndi_pain",      label:"1. Pain intensity",     type:"select", options:["0 — No pain","1 — Very mild","2 — Moderate","3 — Fairly severe","4 — Very severe","5 — Worst imaginable"]},
      {id:"ndi_personal",  label:"2. Personal care",      type:"select", options:["0 — Normal, no extra pain","1 — Normal but painful","2 — Slow and careful","3 — Some help needed","4 — Help every day needed","5 — Unable to care for myself"]},
      {id:"ndi_lifting",   label:"3. Lifting",            type:"select", options:["0 — Lift heavy without extra pain","1 — Lift heavy but extra pain","2 — Cannot lift heavy from floor","3 — Cannot lift heavy from table","4 — Can lift only very light","5 — Cannot lift at all"]},
      {id:"ndi_reading",   label:"4. Reading",            type:"select", options:["0 — As long as I like","1 — As long as I like with slight pain","2 — As long as I like with moderate pain","3 — Not as long as I like","4 — Hardly at all due to pain","5 — Cannot read at all"]},
      {id:"ndi_headache",  label:"5. Headaches",          type:"select", options:["0 — No headaches at all","1 — Slight, infrequent","2 — Moderate, infrequent","3 — Moderate, frequent","4 — Severe, frequent","5 — All the time"]},
      {id:"ndi_concentration",label:"6. Concentration",  type:"select", options:["0 — No difficulty","1 — Slight difficulty","2 — Moderate difficulty","3 — Great difficulty","4 — Very great difficulty","5 — Cannot concentrate at all"]},
      {id:"ndi_work",      label:"7. Work",               type:"select", options:["0 — As much as I like","1 — Usual work but no more","2 — Most usual work but not more","3 — Cannot do usual work","4 — Hardly any work","5 — Cannot do any work"]},
      {id:"ndi_driving",   label:"8. Driving",            type:"select", options:["0 — Without any pain","1 — With slight pain","2 — With moderate pain","3 — With severe pain","4 — Hardly at all","5 — Cannot drive"]},
      {id:"ndi_sleeping",  label:"9. Sleeping",           type:"select", options:["0 — No problem","1 — Slight difficulty","2 — Moderate difficulty","3 — Great difficulty","4 — Very great difficulty","5 — Cannot sleep"]},
      {id:"ndi_recreation",label:"10. Recreation",        type:"select", options:["0 — No limitation","1 — Slight limitation","2 — Moderate limitation","3 — Significant limitation","4 — Hardly any recreation","5 — No recreation"]},
    ],
    score:(v)=>{
      const ids=["ndi_pain","ndi_personal","ndi_lifting","ndi_reading","ndi_headache","ndi_concentration","ndi_work","ndi_driving","ndi_sleeping","ndi_recreation"];
      const scores=ids.map(id=>v[id]? +v[id].split(" — ")[0] : null).filter(x=>x!==null);
      if(!scores.length) return null;
      return Math.round(scores.reduce((a,b)=>a+b,0)/(scores.length*5)*100);
    },
    maxScore:100,
    interpret:(s)=> s<=8?{label:"No disability",color:"#00c97a",text:"0–8%: No disability."}
      :s<=28?{label:"Mild disability",color:"#22d3ee",text:"9–28%: Mild disability. Self-care advice, ergonomics, exercise."}
      :s<=48?{label:"Moderate disability",color:"#ffb300",text:"29–48%: Moderate disability. Conservative management, manual therapy."}
      :s<=64?{label:"Severe disability",color:"#ff8c00",text:"49–64%: Severe disability. Multidisciplinary approach."}
      :{label:"Complete disability",color:"#ff4d6d",text:"65–100%: Complete disability. Psychosocial + medical review needed."},
    mcid:8, unit:"%",
  },

  // ── UPPER LIMB ─────────────────────────────────────────────────────────────
  dash: {
    id:"dash", label:"DASH — Disabilities of Arm, Shoulder & Hand", icon:"💪", category:"Upper Limb",
    description:"30-item questionnaire measuring physical function and symptoms in upper limb conditions. Score 0–100 (higher = more disability). MCID = 10.2.",
    fields:[
      {id:"dash_q1",  label:"Open a tight jar",                    type:"select5"},
      {id:"dash_q2",  label:"Write",                               type:"select5"},
      {id:"dash_q3",  label:"Turn a key",                          type:"select5"},
      {id:"dash_q4",  label:"Prepare a meal",                      type:"select5"},
      {id:"dash_q5",  label:"Push open a heavy door",              type:"select5"},
      {id:"dash_q6",  label:"Place an object overhead",            type:"select5"},
      {id:"dash_q7",  label:"Strenuous household chores",          type:"select5"},
      {id:"dash_q8",  label:"Garden/yard work",                    type:"select5"},
      {id:"dash_q9",  label:"Make a bed",                          type:"select5"},
      {id:"dash_q10", label:"Carry a shopping bag",                type:"select5"},
      {id:"dash_q11", label:"Carry heavy object (>5kg)",           type:"select5"},
      {id:"dash_q12", label:"Change a lightbulb overhead",         type:"select5"},
      {id:"dash_q13", label:"Wash/blow dry your hair",             type:"select5"},
      {id:"dash_q14", label:"Wash your back",                      type:"select5"},
      {id:"dash_q15", label:"Put on a pullover sweater",           type:"select5"},
      {id:"dash_q16", label:"Use a knife to cut food",             type:"select5"},
      {id:"dash_q17", label:"Recreational activities — little effort", type:"select5"},
      {id:"dash_q18", label:"Recreational activities — taking some force/impact",type:"select5"},
      {id:"dash_q19", label:"Recreational activities — free movement of arm",   type:"select5"},
      {id:"dash_q20", label:"Transport yourself from place to place",            type:"select5"},
      {id:"dash_q21", label:"Sexual activities",                   type:"select5"},
      {id:"dash_q22", label:"Past week — arm/shoulder/hand pain",  type:"select5"},
      {id:"dash_q23", label:"Past week — tingling (pins/needles)", type:"select5"},
      {id:"dash_q24", label:"Past week — weakness",                type:"select5"},
      {id:"dash_q25", label:"Past week — stiffness",               type:"select5"},
      {id:"dash_q26", label:"Sleep difficulty due to arm/shoulder/hand",type:"select5"},
      {id:"dash_q27", label:"Feel less capable, confident due to arm",  type:"select5"},
      {id:"dash_q28", label:"Interfere with social activities",    type:"select5"},
      {id:"dash_q29", label:"Limited in work/daily activities",    type:"select5"},
      {id:"dash_q30", label:"Tingling in arm/shoulder/hand",       type:"select5"},
    ],
    score:(v)=>{
      const ids=Array.from({length:30},(_,i)=>`dash_q${i+1}`);
      const scores=ids.map(id=>v[id]? +v[id] : null).filter(x=>x!==null);
      if(scores.length<27) return null;
      return Math.round((scores.reduce((a,b)=>a+b,0)/scores.length - 1)*25);
    },
    maxScore:100,
    interpret:(s)=> s<=20?{label:"Minimal disability",color:"#00c97a",text:"Minimal upper limb disability. Return to normal activity with guidance."}
      :s<=40?{label:"Mild disability",color:"#22d3ee",text:"Mild disability. Conservative treatment, activity modification."}
      :s<=60?{label:"Moderate disability",color:"#ffb300",text:"Moderate disability. Active rehabilitation programme indicated."}
      :{label:"Severe disability",color:"#ff4d6d",text:"Severe disability. Comprehensive assessment — consider surgical opinion if conservative fails."},
    mcid:10, unit:"/100",
  },

  // ── LOWER LIMB ─────────────────────────────────────────────────────────────
  lefs: {
    id:"lefs", label:"LEFS — Lower Extremity Functional Scale", icon:"🦵", category:"Lower Limb",
    description:"20 activities scored 0–4 each. Total /80. Higher = better function. MCID = 9 points.",
    fields: [
      "Usual work/housework/school",
      "Usual hobbies/recreational activities",
      "Getting into/out of bath",
      "Walking between rooms",
      "Put on socks/stockings",
      "Lying in bed",
      "Washing/drying both feet",
      "Light activities at home",
      "Walking outdoors on even ground",
      "Going up/down 1 flight of stairs",
      "Getting into/out of car",
      "Walking 2 blocks",
      "Walking a mile",
      "Going up/down 10 flights of stairs",
      "Running on even ground",
      "Running on uneven ground",
      "Making sharp turns while running fast",
      "Hopping",
      "Rolling over in bed",
      "Squatting",
    ].map((label,i)=>({id:`lefs_q${i+1}`, label, type:"select_lefs"})),
    score:(v)=>{
      const ids=Array.from({length:20},(_,i)=>`lefs_q${i+1}`);
      const scores=ids.map(id=>v[id]!==undefined&&v[id]!==""? +v[id]:null).filter(x=>x!==null);
      if(!scores.length) return null;
      return scores.reduce((a,b)=>a+b,0);
    },
    maxScore:80,
    interpret:(s)=> s>=60?{label:"Minimal limitation",color:"#00c97a",text:"60–80: Minimal limitation. Discharge planning or sports rehabilitation."}
      :s>=40?{label:"Moderate limitation",color:"#ffb300",text:"40–59: Moderate limitation. Active rehabilitation."}
      :{label:"Severe limitation",color:"#ff4d6d",text:"<40: Severe limitation. Comprehensive rehab programme required."},
    mcid:9, unit:"/80",
  },

  koos: {
    id:"koos", label:"KOOS — Knee Injury & OA Outcome Score", icon:"🦴", category:"Lower Limb — Knee",
    description:"42 items across 5 subscales. Each 0–100 (100 = no problems). MCID = 8–10 per subscale. Gold standard for knee conditions.",
    fields:[
      {id:"koos_pain_avg",  label:"Pain subscale — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
      {id:"koos_sym_avg",   label:"Symptoms subscale — average (0=always, 4=never)", type:"slider", min:0, max:4, step:1},
      {id:"koos_adl_avg",   label:"ADL subscale — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
      {id:"koos_sport_avg", label:"Sport/Recreation subscale — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
      {id:"koos_qol_avg",   label:"Knee-related Quality of Life — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
    ],
    score:(v)=>{
      const ids=["koos_pain_avg","koos_sym_avg","koos_adl_avg","koos_sport_avg","koos_qol_avg"];
      const scores=ids.map(id=>v[id]!==undefined&&v[id]!==""? +v[id]:null).filter(x=>x!==null);
      if(!scores.length) return null;
      return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length/4*100);
    },
    maxScore:100,
    interpret:(s)=> s>=80?{label:"Good function",color:"#00c97a",text:"Good knee function. Maintenance and prevention programme."}
      :s>=60?{label:"Moderate function",color:"#ffb300",text:"Moderate limitation. Structured knee rehabilitation."}
      :{label:"Poor function",color:"#ff4d6d",text:"Poor function. Comprehensive assessment — surgical opinion if conservative fails."},
    mcid:10, unit:"/100",
  },

  hoos: {
    id:"hoos", label:"HOOS — Hip Injury & OA Outcome Score", icon:"🦴", category:"Lower Limb — Hip",
    description:"40 items across 5 subscales. Each 0–100 (100 = no problems). MCID = 8–10. Gold standard for hip conditions.",
    fields:[
      {id:"hoos_pain_avg",  label:"Pain subscale — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
      {id:"hoos_sym_avg",   label:"Symptoms subscale — average (0=always, 4=never)", type:"slider", min:0, max:4, step:1},
      {id:"hoos_adl_avg",   label:"ADL subscale — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
      {id:"hoos_sport_avg", label:"Sport/Recreation subscale — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
      {id:"hoos_qol_avg",   label:"Hip-related Quality of Life — average (0=extreme, 4=none)", type:"slider", min:0, max:4, step:1},
    ],
    score:(v)=>{
      const ids=["hoos_pain_avg","hoos_sym_avg","hoos_adl_avg","hoos_sport_avg","hoos_qol_avg"];
      const scores=ids.map(id=>v[id]!==undefined&&v[id]!==""? +v[id]:null).filter(x=>x!==null);
      if(!scores.length) return null;
      return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length/4*100);
    },
    maxScore:100,
    interpret:(s)=> s>=80?{label:"Good function",color:"#00c97a",text:"Good hip function."}
      :s>=60?{label:"Moderate function",color:"#ffb300",text:"Moderate limitation. Structured hip rehabilitation."}
      :{label:"Poor function",color:"#ff4d6d",text:"Poor function. Comprehensive assessment required."},
    mcid:10, unit:"/100",
  },

  // ── PSYCHOLOGICAL ──────────────────────────────────────────────────────────
  tsk: {
    id:"tsk", label:"TSK-11 — Tampa Scale of Kinesiophobia", icon:"🧠", category:"Psychological",
    description:"11 items scored 1–4. Total 11–44. Higher = more fear of movement. MCID = 3.8. Critical for identifying fear-avoidance pattern.",
    fields: [
      "I'm afraid that I might injure myself if I exercise",
      "If I were to try to overcome my pain, it would increase",
      "My body is telling me I have something dangerously wrong",
      "My pain would probably be relieved if I exercised",
      "People aren't taking my medical condition seriously enough",
      "My accident has put my body at risk for the rest of my life",
      "Pain always means I have injured my body",
      "Just because something aggravates my pain doesn't mean it's dangerous",
      "I am afraid that I might injure myself accidentally",
      "Simply being careful that I do not make any unnecessary movements is the safest thing for me",
      "I wouldn't have this much pain if there weren't something potentially dangerous going on",
    ].map((label,i)=>({id:`tsk_q${i+1}`, label:`${i+1}. ${label}`, type:"select_tsk"})),
    score:(v)=>{
      const ids=Array.from({length:11},(_,i)=>`tsk_q${i+1}`);
      // Reverse score items 4 and 8
      const reverse=[3,7]; // 0-indexed
      const scores=ids.map((id,i)=>{
        if(v[id]===undefined||v[id]==="") return null;
        const raw= +v[id];
        return reverse.includes(i)?5-raw:raw;
      }).filter(x=>x!==null);
      if(!scores.length) return null;
      return scores.reduce((a,b)=>a+b,0);
    },
    maxScore:44,
    interpret:(s)=> s<29?{label:"Low kinesiophobia",color:"#00c97a",text:"<29: Low fear of movement. Normal graded activity appropriate."}
      :s<37?{label:"Moderate kinesiophobia",color:"#ffb300",text:"29–36: Moderate. Pain neuroscience education + graded exposure indicated."}
      :{label:"High kinesiophobia",color:"#ff4d6d",text:"≥37: High fear of movement. Psychological co-management strongly recommended. Avoid biomedical language."},
    mcid:4, unit:"/44",
  },

  fabq: {
    id:"fabq", label:"FABQ — Fear Avoidance Beliefs Questionnaire", icon:"⚠", category:"Psychological",
    description:"16 items on 0–6 scale. Two subscales: Physical Activity (FABQ-PA, 4 items) and Work (FABQ-W, 7 items). High scores predict chronicity.",
    fields:[
      {id:"fabq_pa1", label:"PA1. My pain was caused by physical activity", type:"select_fabq"},
      {id:"fabq_pa2", label:"PA2. Physical activity makes my pain worse",   type:"select_fabq"},
      {id:"fabq_pa3", label:"PA3. Physical activity might harm my back",    type:"select_fabq"},
      {id:"fabq_pa4", label:"PA4. I should not do physical activity which makes pain worse", type:"select_fabq"},
      {id:"fabq_w5",  label:"W5. Pain was caused by my work",               type:"select_fabq"},
      {id:"fabq_w6",  label:"W6. Work made/makes pain worse",               type:"select_fabq"},
      {id:"fabq_w7",  label:"W7. My work might harm my back",               type:"select_fabq"},
      {id:"fabq_w9",  label:"W9. I should not do my normal work with pain", type:"select_fabq"},
      {id:"fabq_w10", label:"W10. Cannot do normal work with current pain", type:"select_fabq"},
      {id:"fabq_w11", label:"W11. Cannot do my normal work even if I tried",type:"select_fabq"},
      {id:"fabq_w15", label:"W15. Work is too heavy for me with pain",      type:"select_fabq"},
    ],
    score:(v)=>{
      const pa=["fabq_pa1","fabq_pa2","fabq_pa3","fabq_pa4"].map(id=>v[id]!==undefined&&v[id]!==""? +v[id]:null).filter(x=>x!==null);
      const w=["fabq_w5","fabq_w6","fabq_w7","fabq_w9","fabq_w10","fabq_w11","fabq_w15"].map(id=>v[id]!==undefined&&v[id]!==""? +v[id]:null).filter(x=>x!==null);
      if(!pa.length&&!w.length) return null;
      return {pa:pa.reduce((a,b)=>a+b,0), w:w.reduce((a,b)=>a+b,0)};
    },
    maxScore:null,
    interpret:(s)=>{
      if(!s||typeof s==="number") return {label:"—",color:"#7e6a9a",text:"Complete both subscales."};
      const paHigh=s.pa>15, wHigh=s.w>34;
      if(paHigh&&wHigh) return {label:"High risk (both)",color:"#ff4d6d",text:`PA: ${s.pa}/24 (HIGH) | Work: ${s.w}/42 (HIGH). Strong predictor of chronic pain and work disability. Pain neuroscience education + graded exposure + occupational rehab.`};
      if(wHigh) return {label:"High work fear",color:"#ff8c00",text:`PA: ${s.pa}/24 | Work: ${s.w}/42 (HIGH). Occupational rehabilitation and work hardening indicated.`};
      if(paHigh) return {label:"High activity fear",color:"#ffb300",text:`PA: ${s.pa}/24 (HIGH) | Work: ${s.w}/42. Graded activity exposure + pain education.`};
      return {label:"Low fear avoidance",color:"#00c97a",text:`PA: ${s.pa}/24 | Work: ${s.w}/42. Low fear-avoidance. Normal graded rehabilitation appropriate.`};
    },
    mcid:null, unit:"dual subscale",
  },

  // ── SPORT ──────────────────────────────────────────────────────────────────
  acl_rsi: {
    id:"acl_rsi", label:"ACL-RSI — Return to Sport after ACL", icon:"⚽", category:"Sport",
    description:"12 items scored 0–10. Mean score /100. Measures psychological readiness to return to sport after ACL injury/reconstruction. MCID = 14.8.",
    fields:[
      "I am afraid of re-injuring my knee when I return to sport",
      "I feel relaxed about playing sport",
      "I am confident I can perform at my previous level of sport",
      "I feel that I am unlikely to re-injure my knee",
      "I feel nervous about playing sport",
      "It is likely that I will re-injure my knee",
      "I feel hopeful about returning to sport",
      "I feel that my knee will not stop me from performing to my potential",
      "I am scared of accidentally hitting my knee when I return to sport",
      "I feel optimistic about the future of my sporting career",
      "I feel devastated about the impact of my knee injury on my career",
      "I believe I will perform with confidence when I return to sport",
    ].map((label,i)=>({id:`acl_q${i+1}`, label:`${i+1}. ${label}`, type:"slider", min:0, max:10, step:1})),
    score:(v)=>{
      const ids=Array.from({length:12},(_,i)=>`acl_q${i+1}`);
      const scores=ids.map(id=>v[id]!==undefined&&v[id]!==""? +v[id]:null).filter(x=>x!==null);
      if(!scores.length) return null;
      return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10);
    },
    maxScore:100,
    interpret:(s)=> s>=65?{label:"Psychologically ready",color:"#00c97a",text:"≥65: Psychologically ready for RTS. Proceed with sport-specific training."}
      :s>=40?{label:"Moderate readiness",color:"#ffb300",text:"40–64: Moderate psychological readiness. Address specific fears before RTS."}
      :{label:"Not ready",color:"#ff4d6d",text:"<40: Psychological barrier to RTS. Psychology referral recommended alongside physical rehab."},
    mcid:15, unit:"/100",
  },
};

// ── OM_CAT_COLOR ──
const OM_CAT_COLOR = {
  "Pain":"#ff4d6d", "Function":"#00e5ff", "Spine — Lumbar":"#ffb300",
  "Spine — Cervical":"#ff8c00", "Upper Limb":"#7f5af0", "Lower Limb":"#00c97a",
  "Lower Limb — Knee":"#22d3ee", "Lower Limb — Hip":"#34d399",
  "Psychological":"#f97316", "Sport":"#a3e635",
};

// ── DASH_OPTS ──
const DASH_OPTS    = ["1 — No difficulty","2 — Mild difficulty","3 — Moderate difficulty","4 — Severe difficulty","5 — Unable"];

// ── LEFS_OPTS ──
const LEFS_OPTS    = ["0 — Extreme difficulty / unable","1 — Quite a bit of difficulty","2 — Moderate difficulty","3 — A little bit of difficulty","4 — No difficulty"];

// ── TSK_OPTS ──
const TSK_OPTS     = ["1 — Strongly disagree","2 — Somewhat disagree","3 — Somewhat agree","4 — Strongly agree"];

// ── FABQ_OPTS ──
const FABQ_OPTS    = ["0 — Completely disagree","1","2","3 — Unsure","4","5","6 — Completely agree"];

// ── EXERCISE_DB ──
const EXERCISE_DB = {
  cervical: {
    label:"Cervical Spine", icon:"🔄", color:"#00e5ff",
    categories: {
      "Mobility & Flexibility": [
        { id:"cx_chin_tuck",        name:"Chin Tucks",                              target:"Deep cervical flexors (longus colli/capitis)",       desc:"Sitting or standing. Retract chin horizontally — not downward. Hold 5s.",   sets:3, reps:10, hold:5,  freq:"Hourly",   phase:"Phase 1", evidence:"Strong",    cues:"Double chin. Eyes level. No downward nod.",               progression:"Finger resistance → Cervical flexion at end range" },
        { id:"cx_rotation",         name:"Cervical Rotation AROM",                  target:"SCM, cervical rotators",                            desc:"Slow controlled rotation L & R. Do not force range.",                       sets:2, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep shoulders still. Comfortable end range only.",       progression:"Overpressure with hand → Rotation with retraction" },
        { id:"cx_lat_flex",         name:"Lateral Neck Stretch",                    target:"Upper trapezius, SCM, scalenes, levator scapulae",  desc:"Tilt ear to shoulder. Opposite hand adds gentle overpressure. Hold 30s.",  sets:3, reps:1,  hold:30, freq:"3×/day",  phase:"Phase 1", evidence:"Moderate", cues:"Do not elevate the shoulder being stretched toward.",     progression:"Neural mobilisation add-on (depress contralateral shoulder)" },
        { id:"cx_extension",        name:"Cervical Extension over Towel Roll",      target:"Cervical extensors, posterior capsule",             desc:"Supported head extension over rolled towel. Controlled range.",             sets:2, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Avoid end-range compression if symptomatic.",             progression:"Add rotation in extension" },
        { id:"cx_flex_stretch",     name:"Cervical Flexion Stretch",                target:"Cervical extensors, suboccipitals",                 desc:"Gently tuck chin and nod head forward. Add gentle hand pressure.",          sets:3, reps:1,  hold:20, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Nod first — then bow. No aggressive overpressure.",       progression:"Add diagonal flexion → Sustained hold" },
        { id:"cx_suboccip_release", name:"Suboccipital Self-Release",               target:"Suboccipitals, occiput",                            desc:"Supine. Fingers under skull base. Allow head weight to release. Breathe.",  sets:1, reps:1,  hold:120,freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Relax jaw and neck completely. Breathe deeply.",           progression:"Add gentle small nodding motion" },
      ],
      "Strengthening": [
        { id:"cx_dnf",              name:"Deep Neck Flexor Endurance",              target:"Longus colli, longus capitis",                      desc:"Supine. Chin tuck lifting head 1cm. Hold without pressure drop.",           sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Nod — do not flex fully. Pressure gauge must not drop.",  progression:"Increase hold → Add leg extension" },
        { id:"cx_isometric",        name:"Cervical Isometric Strengthening",        target:"All cervical muscles — direction-specific",         desc:"Hand against head. No movement. Build force 50–70% max. All 4 directions.", sets:3, reps:8,  hold:5,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"No pain or symptom reproduction. Build gradually.",       progression:"Increase resistance → Perturbation training" },
        { id:"cx_scap_ret",         name:"Scapular Retraction",                     target:"Mid/lower trapezius, rhomboids",                    desc:"Squeeze shoulder blades together and down. Essential for cervical posture.", sets:3, reps:15, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Blades together AND down. No shoulder elevation.",        progression:"Band rows → Prone Y/T/W → Single-arm cable row" },
        { id:"cx_neck_ext_iso",     name:"Cervical Extension Isometric Hold",       target:"Cervical extensors, upper trapezius",               desc:"Hands clasped behind head. Press head back into resistance. Hold 5s.",      sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"No movement of head. Steady force build-up.",             progression:"Add retraction before hold → Resistance bands" },
      ],
      "Neural Mobilisation": [
        { id:"cx_neural_slider",    name:"Upper Limb Neural Slider (Median)",       target:"Median nerve — brachial plexus",                   desc:"Side-flex neck away + extend elbow + dorsiflex wrist simultaneously.",      sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"Neck and hand move in OPPOSITE directions. No pain.",     progression:"Add shoulder abduction → Tensioner technique" },
        { id:"cx_neural_ulnar",     name:"Upper Limb Neural Slider (Ulnar)",        target:"Ulnar nerve — C8/T1",                              desc:"Elbow flexion + wrist extension + neck lateral flex away. Slider.",         sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"Smooth rhythmic movement. Stop if sharp or burning pain.", progression:"Add wrist deviation → Tensioner" },
        { id:"cx_neural_radial",    name:"Upper Limb Neural Slider (Radial)",       target:"Radial nerve — C6/C7",                             desc:"Shoulder IR + elbow extension + wrist flex + neck lateral flex away.",      sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"Rhythmic. Smooth and synchronised movements.",            progression:"Add shoulder depression → Tensioner" },
      ],
    }
  },
  shoulder: {
    label:"Shoulder", icon:"🏋", color:"#7f5af0",
    categories: {
      "Rotator Cuff": [
        { id:"sh_er_band",          name:"External Rotation with Band",             target:"Infraspinatus, teres minor",                       desc:"Elbow at side, 90° flexion. Rotate outward against resistance.",            sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Elbow stays against body. Control the return.",           progression:"Increase resistance → ER at 90° abduction → Prone ER" },
        { id:"sh_empty_can",        name:"Empty Can (Supraspinatus Isolation)",     target:"Supraspinatus",                                    desc:"Arm in scapular plane (30° fwd), thumb down. Elevate to 90°.",              sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Stop if painful arc. Pain-free range initially.",         progression:"Full can (thumb up) → Side-lying ER → Overhead load" },
        { id:"sh_prone_er",         name:"Prone External Rotation 90/90",           target:"Infraspinatus, posterior cuff",                    desc:"Prone, arm 90° abducted, elbow 90° flexed. Rotate forearm upward.",         sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep shoulder at 90°. No trunk rotation.",                progression:"Add resistance → Side-lying → Standing cable" },
        { id:"sh_ir_stretch",       name:"Sleeper Stretch",                         target:"Posterior GH capsule, posterior cuff",             desc:"Side-lying on affected side. Other arm pushes forearm down. Hold 30s.",     sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep shoulder blade stable. No impingement pain.",        progression:"Cross-body stretch → Standing posterior stretch" },
        { id:"sh_sidelying_ir",     name:"Side-Lying Internal Rotation",            target:"Subscapularis",                                    desc:"Side-lying, arm at side, elbow 90°. Rotate forearm downward with resistance.", sets:3, reps:12, hold:2, freq:"Daily",   phase:"Phase 2", evidence:"Strong",    cues:"Control rotation — no wrist compensation.",               progression:"Increase resistance → Standing IR with band" },
        { id:"sh_diagonal_d2",      name:"PNF D2 Flexion Pattern",                  target:"Rotator cuff, deltoid — diagonal pattern",         desc:"Start: hand across body down. Finish: hand up/out/rotated above shoulder.", sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Move through full diagonal smoothly. Breathe out on exertion.", progression:"Increase resistance → Add speed → Sport-specific" },
        { id:"sh_rhythmic_stab",    name:"Rhythmic Stabilisation",                  target:"Rotator cuff co-contraction",                      desc:"Shoulder in supported position. Apply alternating perturbations. Resist.",   sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Match resistance — do not let shoulder move.",            progression:"Increase speed → Unstable surface" },
      ],
      "Scapular Stabilisation": [
        { id:"sh_wall_slide",       name:"Wall Slides",                             target:"Serratus anterior, lower trapezius",                desc:"Forearms on wall. Slide arms upward maintaining contact. Protract at top.",  sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep scapulae on ribcage. No winging.",                   progression:"Resistance band → Overhead cable → Push-up plus" },
        { id:"sh_prone_ytw",        name:"Prone Y-T-W",                             target:"Lower trap (Y), mid trap (T), rhomboids (W)",       desc:"Prone on bench. Thumbs up. Raise in Y, T, and W patterns.",                 sets:3, reps:12, hold:3,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Depress scapulae first. No neck tension.",                progression:"Add weight → Cable variations → TRX" },
        { id:"sh_face_pull",        name:"Face Pulls",                              target:"Posterior deltoid, external rotators, mid/lower trap", desc:"Cable/band at face height. Pull to forehead with ER. Elbows high.",      sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Elbows above wrists at end range. External rotate fully.", progression:"Increase resistance → Single-arm" },
        { id:"sh_push_plus",        name:"Push-Up Plus",                            target:"Serratus anterior — highest EMG",                   desc:"Push-up position. At top, add extra protraction. Hold 2s.",                 sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Only the extra protraction is the exercise.",             progression:"Knee → Full → TRX push-up plus" },
        { id:"sh_sidelying_abd",    name:"Side-Lying Shoulder Abduction",           target:"Middle deltoid, supraspinatus — scapular plane",   desc:"Side-lying. Raise arm in scapular plane to 90°. Control return.",           sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Thumb slightly up. Stay in pain-free arc.",               progression:"Add weight → Standing lateral raise" },
        { id:"sh_scap_clock",       name:"Scapular Clock Exercise",                 target:"Periscapular muscles — all directions",             desc:"Seated or prone. Move scapula in all directions in sequence.",              sets:3, reps:8,  hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Isolated scapular movement — do not move arm.",           progression:"Add speed → Add resistance" },
      ],
      "Mobility": [
        { id:"sh_pendulum",         name:"Codman's Pendulum",                       target:"GH joint — passive decompression",                 desc:"Lean forward, arm hanging. Small circles using trunk momentum.",             sets:3, reps:20, hold:0,  freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Arm is PASSIVE. Let gravity do the work.",                progression:"Increase circle size → Add 0.5–1kg" },
        { id:"sh_pec_stretch",      name:"Pectoralis Minor Stretch",                target:"Pectoralis minor, anterior capsule",                desc:"Doorway stretch. Arm at 90°. Step through. Or supine on foam roller.",       sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Do not arch lower back. Core engaged.",                   progression:"Corner stretch → Unilateral with scapular PT cue" },
        { id:"sh_pully",            name:"Shoulder Pulley AROM",                    target:"GH joint — ROM restoration",                       desc:"Overhead pulley. Use good arm to assist bad arm through range.",             sets:3, reps:15, hold:2,  freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Assisted — do not force range. Smooth movement.",         progression:"Reduce assistance → AROM → Add load" },
        { id:"sh_capsule_stretch",  name:"Inferior Capsule Stretch",                target:"Inferior GH capsule — frozen shoulder",            desc:"Supine. Hold arm at side, slightly abducted. Gentle traction downward.",     sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Gentle traction only. No pain reproduction.",             progression:"Increase hold → Combine with ER stretches" },
      ],
    }
  },
  elbow: {
    label:"Elbow & Forearm", icon:"💪", color:"#f59e0b",
    categories: {
      "Lateral Epicondylalgia": [
        { id:"el_isometric_ext",    name:"Wrist Extension Isometric",               target:"ECRB — isometric analgesic",                       desc:"Fist clenched. Press wrist into table or hand. No movement. 5–6/10 effort.", sets:4, reps:1, hold:45, freq:"Daily",     phase:"Phase 1", evidence:"Strong",    cues:"No pain >4/10. Neutral wrist throughout.",                progression:"Progress to Tyler Twist" },
        { id:"el_tyler_twist",      name:"Tyler Twist (Eccentric Wrist Extension)", target:"ECRB — eccentric (Vicenzino protocol)",            desc:"Eccentric wrist extension with rubber bar. Bend + straighten elbow simultaneously.", sets:3, reps:15, hold:0, freq:"Daily", phase:"Phase 2", evidence:"Strongest — 81% success rate", cues:"Eccentric wrist extension only. Use Therabar.",           progression:"Increase bar resistance weekly" },
        { id:"el_wrist_ext_isoton", name:"Wrist Extension Isotonic",                target:"ECRB, ECRL",                                       desc:"Forearm pronated. Light weight. Extend wrist 3s. Lower 3s.",                sets:3, reps:15, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Full range. Control the lowering phase.",                 progression:"Increase load weekly → Add ulnar/radial deviation" },
        { id:"el_grip_strength",    name:"Progressive Grip Strengthening",          target:"Forearm flexors and extensors",                    desc:"Stress ball or grip trainer. Squeeze and release. Full range.",              sets:3, reps:20, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"No pain. Stop if >3/10.",                                 progression:"Increase resistance → Wrist roller" },
      ],
      "Medial Epicondylalgia": [
        { id:"el_wrist_flex_iso",   name:"Wrist Flexion Isometric",                 target:"FCR, FCU, PT — isometric",                         desc:"Press wrist down into table or hand. No movement. 5–6/10 effort.",          sets:4, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"No joint movement. Pain must not exceed 4/10.",           progression:"Isotonic wrist flexion → Eccentric loading" },
        { id:"el_wrist_flex_eccen", name:"Wrist Flexion Eccentric",                 target:"FCR, FCU — eccentric",                             desc:"Supinate forearm. Flex wrist, use other hand to extend eccentrically.",      sets:3, reps:15, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Slow eccentric (3–4s down). Control throughout.",         progression:"Increase load → Functional tools" },
        { id:"el_forearm_stretch",  name:"Forearm Flexor Stretch",                  target:"Forearm flexors — medial epicondyle",               desc:"Elbow extended. Wrist extended. Gentle overpressure with other hand.",       sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Feel stretch in forearm — not elbow pain.",               progression:"Add forearm supination → Neural component" },
      ],
      "Elbow Mobility": [
        { id:"el_pron_sup",         name:"Forearm Pronation-Supination",            target:"Pronator teres, supinator",                         desc:"Elbow at 90°. Slowly pronate and supinate. Use dowel for feedback.",         sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep elbow still. Move only at forearm.",                 progression:"Add resistance with weighted dowel" },
        { id:"el_active_flex_ext",  name:"Elbow Active ROM Flexion-Extension",      target:"Biceps, brachialis, triceps",                       desc:"Slowly flex and extend elbow through available range.",                      sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Move to comfortable end range. No forcing.",              progression:"Add gentle overpressure → Weighted ROM" },
        { id:"el_tricep_stretch",   name:"Triceps Stretch",                         target:"Triceps brachii, posterior capsule",                desc:"Arm overhead, elbow bent. Other hand pulls elbow back gently.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep neck neutral. Feel posterior arm stretch.",           progression:"Add gentle overpressure → Combined shoulder stretch" },
      ],
    }
  },
  wrist_hand: {
    label:"Wrist & Hand", icon:"🖐", color:"#e879f9",
    categories: {
      "Wrist Rehabilitation": [
        { id:"wh_wrist_flex_ext",   name:"Wrist Flexion-Extension AROM",            target:"Wrist flexors and extensors",                      desc:"Forearm supported. Move wrist through flexion and extension slowly.",        sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Support forearm. Move only the wrist.",                   progression:"Add resistance → Wrist roller" },
        { id:"wh_radial_ulnar",     name:"Radial-Ulnar Deviation",                  target:"ECRL, ECU, FCR, FCU",                              desc:"Forearm pronated. Move wrist side to side.",                                 sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep forearm still. Controlled movement.",                progression:"Add resistance → Combined diagonal" },
        { id:"wh_tendon_glide",     name:"Tendon Gliding Exercises",                target:"FDP, FDS, extensor tendons",                       desc:"Sequence: straight → hook fist → full fist → flat fist → tip-pinch. 5s each.", sets:3, reps:10, hold:5, freq:"3×/day", phase:"Phase 1", evidence:"Strong",    cues:"Move through each position fully. Slow and controlled.",  progression:"Add resistance → Functional grip tasks" },
        { id:"wh_nerve_glide",      name:"Median Nerve Glide (CTS)",                target:"Median nerve — carpal tunnel",                     desc:"Wrist neutral. Extend fingers/wrist → add neck lateral flex away. Slider.", sets:3, reps:10, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Moderate", cues:"No pain. Mild stretch only. Smooth movement.",            progression:"Tensioner technique if slider resolves" },
        { id:"wh_grip_strength2",   name:"Grip and Pinch Strengthening",            target:"Intrinsic hand muscles, extrinsic flexors",        desc:"Putty or grip trainer. Full grip and 3-point pinch. Progressive resistance.", sets:3, reps:20, hold:2, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Full range. Maintain neutral wrist.",                      progression:"Increase resistance → Functional tools" },
        { id:"wh_finger_ext",       name:"Finger Extension Strengthening",          target:"Extensor digitorum — balanced grip",               desc:"Rubber band around fingers. Open hand against resistance. All fingers.",     sets:3, reps:20, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Fully open hand. Control return.",                        progression:"Increase resistance → Individual finger extensions" },
      ],
      "De Quervain's / Thumb": [
        { id:"wh_thumb_abduction",  name:"Thumb Abduction Strengthening",           target:"APL, EPB, APB",                                    desc:"Rubber band around thumb and index. Open against resistance.",               sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"No wrist deviation during exercise.",                     progression:"Increase band resistance → Pinch tasks" },
        { id:"wh_dq_stretch",       name:"Finkelstein Stretch (De Quervain's)",     target:"APL, EPB — De Quervain's syndrome",                desc:"Thumb in palm, fingers wrapped over. Ulnar deviate wrist gently. Hold.",    sets:3, reps:1,  hold:20, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Gentle. Stop if sharp pain. Self-mobilisation only.",     progression:"Add gentle ulnar deviation in function" },
        { id:"wh_opposition",       name:"Thumb Opposition Exercises",              target:"Opponens pollicis, intrinsics — fine motor",       desc:"Touch thumb to each fingertip in sequence. Slow and precise.",              sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Precise contact. No substitution patterns.",              progression:"Add resistance with putty → Fine motor tasks" },
      ],
    }
  },
  lumbar: {
    label:"Lumbar Spine", icon:"🦴", color:"#ffb300",
    categories: {
      "Core Stabilisation": [
        { id:"lb_tva",              name:"Transversus Abdominis Activation",         target:"Transversus abdominis, multifidus",                desc:"Supine hook-lying. Draw navel 30% toward spine. Hold. No breath-holding.",  sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"30% contraction. Normal breathing. No rib flare.",        progression:"Leg slide → Dead bug → Plank" },
        { id:"lb_dead_bug",         name:"Dead Bug",                                 target:"TA, anti-extension core",                          desc:"Supine, arms up, hips/knees 90°. Lower opposite arm/leg toward floor.",     sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Lower back must NOT lift. Exhale as you lower.",          progression:"Resistance band → Both legs → Add weight" },
        { id:"lb_bird_dog",         name:"Bird Dog",                                 target:"Multifidus, gluteus maximus, anti-rotation core", desc:"Quadruped. Extend opposite arm/leg. Hold 8s. Return under control.",        sets:3, reps:10, hold:8,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Do not rotate pelvis. Squeeze glute on extended leg.",    progression:"Add resistance → Increase hold → 3-point bird dog" },
        { id:"lb_plank",            name:"Plank (Prone)",                            target:"TA, erector spinae, glutes",                       desc:"Forearms and toes. Neutral spine. Brace core. Hold.",                       sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Long body. Squeeze glutes. Do not hold breath.",          progression:"Increase hold → Side plank → Dynamic plank" },
        { id:"lb_side_plank",       name:"Side Plank",                               target:"Quadratus lumborum, obliques, glute medius",       desc:"Forearm side plank. Hips forward and up. Hold.",                            sets:3, reps:1,  hold:20, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Stack feet or stagger. Push hip to ceiling.",            progression:"Hip dip → Leg raise → Full side plank" },
        { id:"lb_hollow_hold",      name:"Hollow Body Hold",                         target:"Rectus abdominis, TA, hip flexors",                desc:"Supine. Press lower back flat. Arms overhead, legs extended and raised 6\".", sets:3, reps:1, hold:20, freq:"Daily",   phase:"Phase 2", evidence:"Moderate", cues:"Do not allow lower back to lift. Bend knees if needed.",  progression:"Increase hold → Add rocking motion" },
        { id:"lb_stir_pot",         name:"Stir the Pot (Swiss Ball)",                target:"TA, obliques, anti-rotation",                      desc:"Plank on Swiss ball. Trace large circles with elbows. Neutral spine.",       sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Circles each direction. Don't let hips rotate.",          progression:"Increase circle size → Increase speed" },
        { id:"lb_rollout",          name:"Ab Wheel Rollout",                         target:"TA, latissimus — anti-extension strength",          desc:"Kneel with ab wheel. Roll forward maintaining flat back. Return.",           sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 3", evidence:"Strong",    cues:"Do NOT let hips sag. Neutral spine throughout.",          progression:"Increase ROM → Standing rollout" },
        { id:"lb_pelvic_tilt",      name:"Posterior Pelvic Tilt",                    target:"TA, glutes, lumbar flexors",                       desc:"Supine hook-lying. Flatten lower back against floor. Hold 10s.",            sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Breathe normally. Gently tighten abdomen.",               progression:"Standing PPT → Functional positions" },
      ],
      "Hip & Glute Integration": [
        { id:"lb_glute_bridge",     name:"Glute Bridge",                             target:"Gluteus maximus, hamstrings",                      desc:"Supine hook-lying. Drive hips up. Squeeze glutes. Hold 2s at top.",          sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Drive through heels. Neutral spine — don't hyperextend.", progression:"Single-leg → Add weight → Hip thrust" },
        { id:"lb_single_leg_bridge",name:"Single-Leg Bridge",                        target:"Gluteus maximus — unilateral loading",             desc:"Glute bridge with one leg extended. Drive through planted heel.",            sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep pelvis level. Squeeze glute on planted side.",       progression:"Add load → Hamstring curl on Swiss ball" },
        { id:"lb_hip_hinge",        name:"Hip Hinge (Deadlift Pattern)",             target:"Gluteus maximus, hamstrings, TA",                  desc:"Stand, hinge at hips NOT waist. Maintain neutral spine.",                    sets:3, reps:12, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Push hips back — not knees forward. Chest up.",           progression:"Dowel drill → Romanian DL → Conventional DL" },
        { id:"lb_hip_flexor",       name:"Hip Flexor Stretch (Kneeling Lunge)",      target:"Iliopsoas, rectus femoris",                        desc:"Kneeling lunge. Posterior pelvic tilt. Drive hip forward. Hold 30s.",        sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Tuck pelvis FIRST, THEN lean forward. No lumbar extension.", progression:"Add thoracic rotation → RNT lunge" },
        { id:"lb_suitcase_carry",   name:"Suitcase Carry (Lateral Stability)",       target:"QL, obliques, lateral stability",                  desc:"Hold weight in one hand. Walk maintaining level hips and shoulders.",        sets:3, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Don't let loaded side drop. Resist Trendelenburg.",       progression:"Increase load → Increase distance → Overhead carry" },
        { id:"lb_farmers_carry",    name:"Farmer's Carry",                           target:"Core stability, grip, postural endurance",         desc:"Hold heavy weights by sides. Walk with perfect posture 20m.",               sets:3, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Tall posture. Don't let weight pull shoulders down.",     progression:"Increase load → Suitcase carry → Overhead" },
      ],
      "McKenzie Extension": [
        { id:"lb_prone_lying",      name:"Prone Lying",                              target:"Lumbar extensors — posterior disc restoration",    desc:"Lie prone flat. Relax completely. 5 min.",                                   sets:3, reps:1,  hold:300,freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Pillow under abdomen if uncomfortable initially.",        progression:"Props on elbows → Press-ups → Standing extensions" },
        { id:"lb_press_up",         name:"McKenzie Press-Up",                        target:"Lumbar extensors — centralisation",                desc:"Prone. Hands under shoulders. Push upper body up. Pelvis stays down.",       sets:3, reps:10, hold:1,  freq:"2-hourly",  phase:"Phase 1", evidence:"Strong",    cues:"Let lumbar sag. Relax abdomen. Centralisation = good sign.", progression:"Increase reps → Sustained extension → Standing" },
        { id:"lb_standing_ext",     name:"Standing Extension",                       target:"Lumbar extensors — erect posture loading",         desc:"Stand with hands on low back. Extend lumbar spine backward 10 times.",       sets:3, reps:10, hold:1,  freq:"2-hourly",  phase:"Phase 1", evidence:"Strong",    cues:"Breathe out as you extend. Keep legs straight.",          progression:"Increase ROM → Add over-pressure with hands" },
      ],
      "Flexion & Mobility": [
        { id:"lb_knee_chest",       name:"Knee-to-Chest Stretch",                    target:"Lumbar extensors, facet joints, piriformis",       desc:"Supine. Both knees to chest. Gentle rocking. Hold 30s.",                    sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Do not pull head forward. Relax completely.",             progression:"Single knee → Figure 4 → Seated forward bend" },
        { id:"lb_cat_camel",        name:"Cat-Camel",                                target:"Lumbar & thoracic mobility — full range",           desc:"Quadruped. Arch up (cat) then sag (camel). Slow rhythmic.",                 sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Move to comfortable end range each way.",                 progression:"Add rotation → Combine with bird dog" },
        { id:"lb_rotation_stretch", name:"Supine Lumbar Rotation Stretch",           target:"Lumbar rotators, thoracic extensors, piriformis",  desc:"Supine, knees bent. Drop both knees to one side. Hold 30s.",                sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep shoulders flat. Let gravity rotate legs.",           progression:"Add leg extension → Add hip movement" },
        { id:"lb_piriformis",       name:"Piriformis Stretch",                       target:"Piriformis, deep hip external rotators",           desc:"Supine. Cross ankle over opposite knee. Pull thigh toward chest.",           sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep ankle flexed. Feel stretch deep in buttock.",        progression:"Seated figure 4 → Pigeon pose" },
      ],
      "Loading & Functional": [
        { id:"lb_squat",            name:"Squat Pattern Progression",                target:"Quadriceps, glutes, lumbar extensors",             desc:"Bodyweight squat — 3s descent, 1s pause, 1s rise.",                         sets:3, reps:12, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Neutral spine. Knees track toes. Hips back and down.",    progression:"Add weight → Bulgarian split squat → Single-leg" },
        { id:"lb_copenhagen",       name:"Copenhagen Hip Adduction",                 target:"Hip adductors — lateral pelvic stability",         desc:"Side plank. Top leg on bench. Lift bottom leg to meet it. Hold.",           sets:3, reps:10, hold:3,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Keep hips forward. Controlled lift.",                     progression:"Increase hold → Reduce support" },
      ],
    }
  },
  hip: {
    label:"Hip", icon:"🦴", color:"#f97316",
    categories: {
      "Gluteal Strengthening": [
        { id:"hp_clam",             name:"Clamshells",                               target:"Gluteus medius, hip external rotators",            desc:"Side-lying, hips 45° flexed. Rotate top knee up. Keep pelvis still.",        sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Do not rotate pelvis backward.",                          progression:"Resistance band → Side-lying abduction → Standing" },
        { id:"hp_lat_walk",         name:"Lateral Band Walks",                       target:"Gluteus medius, minimus, TFL",                     desc:"Band around ankles/knees. Semi-squat. Step sideways.",                       sets:3, reps:15, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep knees tracking over toes. Control trailing leg.",    progression:"Monster walks → Increase resistance → Single-leg" },
        { id:"hp_hip_thrust",       name:"Hip Thrust",                               target:"Gluteus maximus — highest EMG",                    desc:"Upper back on bench, feet flat. Drive hips up. Squeeze glutes at top.",     sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Neutral spine at top. Drive through heels.",              progression:"Barbell → Single-leg → Banded hip thrust" },
        { id:"hp_step_up",          name:"Step-Ups",                                 target:"Gluteus maximus, hip abductors, quadriceps",       desc:"Step onto box. Drive through heel. Control lowering.",                       sets:3, reps:12, hold:1,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Lean slightly forward. Don't push off back foot.",        progression:"Increase step height → Add weight → Lateral step-ups" },
        { id:"hp_monster_walk",     name:"Monster Walks (Forward/Backward)",         target:"Gluteus medius, TFL — dynamic stability",          desc:"Band around ankles. Walk forward/backward in quarter-squat.",               sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Toe out slightly. Keep knees slightly bent.",             progression:"Increase resistance → Add diagonal direction" },
        { id:"hp_fire_hydrant",     name:"Fire Hydrant",                             target:"Gluteus medius, hip abductors",                    desc:"Quadruped. Lift knee out to side maintaining hip height.",                   sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Do not rotate pelvis or shift weight.",                   progression:"Add resistance band → Extend leg → Standing" },
        { id:"hp_standing_abd",     name:"Standing Hip Abduction",                   target:"Gluteus medius, minimus",                          desc:"Stand on one leg. Lift other leg out to side 30–40°. Control return.",       sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep pelvis level. No Trendelenburg.",                    progression:"Add ankle weight → Cable → SL balance with abduction" },
        { id:"hp_side_step_squat",  name:"Side-Step Squats with Band",               target:"Gluteus medius, quadriceps — functional",          desc:"Band above knees. Squat position. Side steps maintaining knee alignment.",   sets:3, reps:20, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Stay low throughout. Knees over toes.",                   progression:"Increase resistance → Add overhead press" },
      ],
      "Mobility & Flexibility": [
        { id:"hp_90_90",            name:"90/90 Hip Stretch",                        target:"Hip IR & ER — both hips",                          desc:"Seated on floor, both hips at 90°. Sit tall. Hold 60s per side.",           sets:2, reps:1,  hold:60, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Both sit bones on floor. Breathe.",                       progression:"Forward fold → Lateral lean → Dynamic transitions" },
        { id:"hp_pigeon",           name:"Pigeon Pose",                              target:"Piriformis, deep hip external rotators",           desc:"Front leg at 90°. Back leg extended. Lower chest forward.",                  sets:3, reps:1,  hold:60, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Front foot flexed. Square hips.",                         progression:"Quad stretch add-on → Supported → Dynamic pigeon" },
        { id:"hp_thomas",           name:"Thomas Test Stretch",                      target:"Iliopsoas, rectus femoris",                        desc:"Supine at table edge. Hold one knee. Let other leg hang and feel stretch.", sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Lumbar flat. No external rotation of hanging leg.",       progression:"Add knee bend (RF) → Standing lunge → RNT lunge" },
        { id:"hp_adductor_stretch", name:"Adductor Stretch (Butterfly)",             target:"Hip adductors — groin",                            desc:"Seated. Soles of feet together. Gently press knees toward floor.",           sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Lean forward from hips — don't round lower back.",        progression:"Increase ROM → Side-lying → Standing sumo stretch" },
        { id:"hp_ober_stretch",     name:"IT Band / TFL Stretch (Ober's)",           target:"IT band, TFL",                                     desc:"Side-lying. Top leg extended behind body. Allow to drop by gravity.",        sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Hips stacked. Don't flex hip — extend and adduct.",      progression:"Cross-leg stretch → Foam roller → Lateral wall stretch" },
        { id:"hp_couch_stretch",    name:"Couch Stretch (Rectus Femoris)",           target:"Rectus femoris, hip flexors",                      desc:"Rear foot against wall. Front leg forward. PPT first. Upright posture.",     sets:3, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"PPT first. Feel stretch front of thigh — not knee.",     progression:"Increase hold → Add trunk extension → Walking lunge" },
      ],
      "Hip Flexor Loading": [
        { id:"hp_psoas_march",      name:"Psoas March",                              target:"Iliopsoas, TA — coordinated loading",               desc:"Standing. Resist hip flexion with hand. March in place with resistance.",    sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Maintain upright posture. Don't lean back.",              progression:"Band resistance → Step up → Single-leg balance march" },
        { id:"hp_hip_flex_raise",   name:"Seated Hip Flexion Raise",                 target:"Iliopsoas — rehabilitation loading",                desc:"Seated on edge of table. Slowly raise knee 5cm. Hold 10s. Lower.",           sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Don't lean back. Isolated hip flexion.",                  progression:"Add resistance above knee → Standing → Resisted march" },
      ],
    }
  },
  knee: {
    label:"Knee", icon:"🦵", color:"#22d3ee",
    categories: {
      "Quadriceps": [
        { id:"kn_tqe",              name:"Terminal Knee Extension (TKE)",            target:"VMO — last 30° extension",                         desc:"Band behind knee. Drive to full extension against resistance.",              sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Full extension — lock knee out. Keep foot on floor.",     progression:"Increase resistance → Single-leg → Mini-squat" },
        { id:"kn_vmo_squat",        name:"VMO Squat (Narrow Stance)",                target:"VMO — medial quadriceps",                          desc:"Narrow stance, toes slightly out. Squat to 60°.",                            sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Track knee over 2nd toe. No knee cave.",                  progression:"Add weight → Bulgarian split squat → Single-leg" },
        { id:"kn_step_down",        name:"Eccentric Step-Down",                      target:"Quadriceps eccentric, glute medius — alignment",   desc:"Stand on step. Lower heel of other foot to floor in 4 seconds.",            sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"4-second lowering. Knee tracks over toe. No valgus.",     progression:"Increase step height → Add weight vest → SL squat" },
        { id:"kn_sit_to_stand",     name:"Sit-to-Stand (Chair Squats)",              target:"Quadriceps, glutes — functional pattern",          desc:"Rise from chair slowly (3s). Control lowering (3s). Hold at top.",           sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Lean forward first. Drive through heels. Stand tall.",    progression:"Lower chair → Add weight → One-legged STS" },
        { id:"kn_quad_set",         name:"Quad Set (Isometric Quad Contraction)",    target:"Quadriceps — isometric",                           desc:"Supine. Towel under knee. Press knee down into towel. Hold 10s.",            sets:3, reps:10, hold:10, freq:"Hourly",   phase:"Phase 1", evidence:"Strong",    cues:"Feel quads tighten without knee moving.",                 progression:"Straight leg raise → TKE" },
        { id:"kn_straight_leg",     name:"Straight Leg Raise",                       target:"Quadriceps (isometric), hip flexors",               desc:"Supine. Quad set first. Raise straight leg to 45°. Hold 2s. Lower.",         sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Quad set BEFORE raising. Keep foot dorsiflexed.",         progression:"Add ankle weight → Progress to TKE" },
        { id:"kn_leg_press",        name:"Leg Press (Short Arc)",                    target:"Quadriceps, glutes — controlled loading",          desc:"Leg press machine. Start from 90°. Extend to full extension. Slow return.",  sets:3, reps:12, hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"Push through whole foot. Control lowering 3–4s.",         progression:"Increase load → Full range → Single-leg" },
      ],
      "Hamstrings": [
        { id:"kn_nordic",           name:"Nordic Hamstring Curl",                    target:"Biceps femoris, semimembranosus — eccentric",      desc:"Kneel, feet anchored. Lower body slowly controlling with hamstrings.",       sets:3, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strongest — 51% hamstring injury reduction", cues:"Lower as slowly as possible. Push up with hands.",        progression:"Increase reps → Add resistance → Glider curl" },
        { id:"kn_rdl",              name:"Romanian Deadlift (RDL)",                  target:"Hamstrings, gluteus maximus",                      desc:"Hinge at hips. Lower bar along legs. Feel hamstring stretch.",               sets:3, reps:12, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Bar stays close to legs. Neutral spine.",                 progression:"Single-leg → Add weight → Deficit RDL" },
        { id:"kn_prone_curl",       name:"Prone Hamstring Curl",                     target:"Hamstrings — isolated loading",                    desc:"Prone. Bend knee against gravity or resistance. Slow eccentric return.",      sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Hip stays down. Control lowering (3–4s).",                progression:"Add resistance → Single-leg → Glider curl" },
        { id:"kn_glider_curl",      name:"Swiss Ball Hamstring Curl",                target:"Hamstrings, glutes — closed chain",                desc:"Supine, feet on ball. Bridge up. Curl feet toward hips.",                    sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep hips up throughout. Control return.",                progression:"Single-leg → Add eccentric phase only" },
        { id:"kn_hamstring_str",    name:"Hamstring Stretch (Supine)",               target:"Hamstrings — neural and muscular",                 desc:"Supine. Hold thigh. Extend knee until stretch felt. Hold 30s.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"PPT to increase neural component.",                       progression:"Standing → Hurdler stretch → Slump add-on" },
      ],
      "Patellar Tendinopathy": [
        { id:"kn_isometric_wall",   name:"Isometric Wall Sit",                       target:"Patellar tendon — isometric analgesic",            desc:"Back against wall. Squat at 60–90°. Both legs.",                            sets:4, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"60–90° knee bend. 70% effort. No pain >4/10.",            progression:"Single-leg → Add weight → Isotonic" },
        { id:"kn_slow_squat",       name:"Heavy Slow Resistance Squat",              target:"Patellar tendon — isotonic loading",               desc:"Slow tempo squat: 3s down, 3s up. Progressive load.",                        sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong — Kongsgaard protocol", cues:"3s down, 2s pause, 3s up. Progress load weekly.",         progression:"Increase load → Single-leg → Plyometric" },
        { id:"kn_decline_squat",    name:"Decline Board Squat",                      target:"Patellar tendon — high load eccentrics",           desc:"Stand on 25° decline board. Single-leg squat. Slow eccentric.",              sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Use hands for balance initially. Slow down.",             progression:"Increase decline → Add load → Hop landing" },
      ],
      "ACL Rehab": [
        { id:"kn_acl_phase1",       name:"Early ACL Quad Activation",                target:"Quadriceps — ACL graft protection",                desc:"Quad sets + SLR + TKE (0–90°). Avoid open chain 0–45° for 12 weeks.",       sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Avoid full extension open chain in early graft healing.", progression:"Progress range at 12 weeks → Closed chain loading" },
        { id:"kn_acl_balance",      name:"Neuromuscular Control — Single Leg",       target:"Proprioception, quadriceps, glute med — ACL",     desc:"Single-leg balance. Eyes closed. Perturbation. Landing training.",          sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Slight knee flexion. React to perturbations.",            progression:"Unstable surface → Perturbation → Jump landing" },
        { id:"kn_drop_jump",        name:"Drop Jump Landing Training",               target:"Quadriceps, glutes — ACL prevention",              desc:"Step off box. Land softly with triple flexion. Hold 2s.",                    sets:3, reps:8,  hold:2,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Land soft — quiet feet. Hips back, knees tracking.",     progression:"Increase height → Add lateral → Sprint → Cut" },
      ],
    }
  },
  ankle: {
    label:"Ankle & Foot", icon:"👣", color:"#a3e635",
    categories: {
      "Achilles Tendinopathy": [
        { id:"ank_ec_drop",         name:"Eccentric Heel Drop (Alfredson)",          target:"Gastrocnemius, soleus — eccentric",                desc:"Stand on step. Rise with both feet, lower with one. Full range.",            sets:3, reps:15, hold:0,  freq:"2×/day",   phase:"Phase 2", evidence:"Strongest — gold standard", cues:"Lower all the way. Use other foot to rise. Through PAIN.", progression:"Add backpack weight (10% BW) → Increase weekly" },
        { id:"ank_isometric_calf",  name:"Isometric Calf Hold",                      target:"Achilles — isometric analgesic",                   desc:"Single-leg calf raise hold at top. 45s holds.",                             sets:4, reps:1,  hold:45, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Max comfortable effort. Burning is normal.",              progression:"Progress to Alfredson protocol" },
        { id:"ank_heavy_slow_calf", name:"Heavy Slow Resistance Calf Raise",         target:"Achilles tendon — isotonic remodelling",           desc:"Seated (soleus) + standing (gastrocnemius). Slow 3:3 tempo with load.",      sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"3s up, 2s hold, 3s down. Progress load weekly.",          progression:"Increase load → Single-leg → Plyometric" },
      ],
      "Ankle Stability": [
        { id:"ank_single_leg",      name:"Single Leg Balance",                       target:"Peroneals, ankle stabilisers, proprioception",     desc:"Stand on one leg. Eyes open → eyes closed.",                                sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Slight knee bend. Focus point at eye level.",             progression:"Eyes closed → Unstable surface → SEBT → Perturbation" },
        { id:"ank_peroneal",        name:"Peroneal Strengthening (Eversion)",        target:"Peroneus longus & brevis",                         desc:"Band around foot. Evert outward against resistance. Slow controlled.",       sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Move only at ankle — not knee or hip.",                   progression:"Increase resistance → Standing eversion → Lateral hops" },
        { id:"ank_calf_raise",      name:"Single-Leg Calf Raise",                    target:"Gastrocnemius, soleus, FHL",                       desc:"Single-leg calf raise. 3s up, 2s hold, 3s down.",                           sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Full plantarflexion at top. Control eccentric.",          progression:"Add load → Plyometric → Eccentric drop" },
        { id:"ank_reach_sebt",      name:"Star Excursion Balance (SEBT) Reaches",   target:"Ankle stability, glutes, proprioception",          desc:"Single-leg stance. Reach other foot in 8 directions as far as possible.",   sets:3, reps:6,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Touch and return — don't weight bear on reaching foot.",  progression:"Increase reach distance → Add perturbation" },
        { id:"ank_lateral_hops",    name:"Lateral Hop Progression",                  target:"Peroneals, ankle stabilisers — reactive",          desc:"Hop laterally over line. Double-leg → single-leg. Land softly.",             sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Quiet landing. Triple flexion. No valgus collapse.",     progression:"Increase distance → Add forward component → Speed" },
        { id:"ank_tibialis_ant",    name:"Tibialis Anterior Strengthening",          target:"Tibialis anterior — dorsiflexion",                 desc:"Band around foot. Dorsiflex (pull toes up) against resistance.",             sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Move only at ankle. Full range dorsiflexion.",            progression:"Increase resistance → Eccentric lowering → Heel walks" },
      ],
      "Plantar Fascia": [
        { id:"ank_short_foot",      name:"Short Foot Exercise",                      target:"Intrinsic foot muscles, tibialis posterior",       desc:"Draw ball of foot toward heel without curling toes. Dome the arch.",         sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Don't curl toes. Don't roll inward.",                     progression:"Standing → Single-leg → Walking short foot" },
        { id:"ank_pf_stretch",      name:"Plantar Fascia Stretch",                   target:"Plantar fascia, toe flexors",                      desc:"Cross foot over knee. Pull toes back. Hold.",                                sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Pull toes back — feel stretch in arch. Before first steps.", progression:"Wall toe stretch → Towel stretch → Calf combine" },
        { id:"ank_calf_stretch",    name:"Gastrocnemius Calf Stretch",               target:"Gastrocnemius, Achilles",                          desc:"Wall stretch. Rear leg straight. Heel on floor. Hold 30s.",                  sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Keep heel down. Knee straight.",                          progression:"Bent knee (soleus) → Eccentric drops" },
        { id:"ank_marble_pickup",   name:"Towel Scrunch / Marble Pickup",            target:"Intrinsic foot muscles",                           desc:"Seated. Scrunch towel with toes or pick up marbles with toes.",              sets:3, reps:20, hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Work through full toe flexion range.",                    progression:"Short foot → Single-leg balance → Toe yoga" },
      ],
    }
  },
  thoracic: {
    label:"Thoracic Spine", icon:"🫀", color:"#d946ef",
    categories: {
      "Mobility": [
        { id:"tx_foam_ext",         name:"Thoracic Extension on Foam Roller",        target:"Thoracic extensors, posterior capsule",            desc:"Foam roller across mid-thoracic. Extend over roller. Breathe out.",          sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Work each segment. Support head. Exhale on extension.",   progression:"Add rotation → Book openings → Manipulation" },
        { id:"tx_book_open",        name:"Book Openings (Thoracic Rotation)",        target:"Thoracic rotators, posterior capsule, pectorals", desc:"Side-lying, knees 90°. Top arm opens chest to ceiling.",                    sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Knees stacked and still. Let arm fall with gravity.",     progression:"Band resistance → Quadruped rotation → Standing" },
        { id:"tx_quadruped_rot",    name:"Quadruped Thoracic Rotation",              target:"Thoracic rotators",                                desc:"Quadruped. Hand behind head. Rotate thorax — elbow to ceiling.",             sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Keep lumbar still. Rotate thorax only.",                  progression:"Add resistance → Standing rotation → Woodchop" },
        { id:"tx_thread_needle",    name:"Thread the Needle",                        target:"Thoracic rotators, shoulder mobility combined",    desc:"Quadruped. One arm threads under body toward opposite side.",                sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Let shoulder rest on floor at end range.",                progression:"Add arm reach overhead → Dynamic movement" },
        { id:"tx_seated_rot",       name:"Seated Thoracic Rotation",                 target:"Thoracic rotators, rib cage mobility",             desc:"Seated. Arms crossed. Rotate thorax each direction. Breathe out.",           sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Initiate from thorax — not lumbar. Keep hips still.",     progression:"Add overpressure → Standing → Band resistance" },
        { id:"tx_rib_mobilise",     name:"Rib Mobilisation Breathing",               target:"Intercostals, rib cage — respiratory mobility",    desc:"Supine or seated. Breathe deeply into sides and back.",                     sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Breathe into the resistance. Expand in all directions.",  progression:"Add resistance with hand → Seated → Standing" },
        { id:"tx_thoracic_snag",    name:"Thoracic Self-SNAG",                       target:"Thoracic facet joints — mobilisation with movement", desc:"Towel around spinous process. Pull forward as you flex thorax.",           sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Pull towel forward AND up slightly as you flex.",         progression:"Add rotation → Therapist-applied SNAG" },
      ],
      "Strengthening": [
        { id:"tx_prone_cobra",      name:"Prone Cobra",                              target:"Thoracic extensors, lower trapezius, rhomboids",   desc:"Prone. Arms at side thumbs up. Lift chest off floor. Hold 2s.",             sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Depress scapulae first. No neck extension.",              progression:"Add arm positions → Prone Y/T/W → Band resistance" },
        { id:"tx_seated_row",       name:"Seated Row",                               target:"Mid trapezius, rhomboids, thoracic extensors",     desc:"Cable or band row to lower chest. Elbows tucked. Retract scapulae.",         sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Pull elbows past torso. Squeeze blades together at end.", progression:"Increase resistance → Single-arm → Split-stance" },
        { id:"tx_pull_down",        name:"Lat Pull-Down",                            target:"Latissimus dorsi, thoracic extensors, lower trap", desc:"Wide or narrow grip. Pull bar to upper chest. Depress scapulae.",           sets:3, reps:12, hold:2,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"Lead with elbows. Don't lean back excessively.",          progression:"Increase weight → Neutral grip → Single-arm → Pull-up" },
      ],
    }
  },
  posture_correction: {
    label:"Posture Correction", icon:"🧍", color:"#ff4d6d",
    categories: {
      "Upper Crossed Syndrome": [
        { id:"pc_ucs_chin",         name:"Chin Tuck + Scapular Retraction",          target:"DNF, lower/mid trap — UCS correction",            desc:"Chin tuck + retract and depress scapulae simultaneously. Hold 5s.",          sets:3, reps:10, hold:5,  freq:"Hourly",   phase:"Phase 1", evidence:"Strong",    cues:"Two movements together. Eyes level. No shoulder shrug.",  progression:"Wall angle → Add resistance → Functional carry-over" },
        { id:"pc_band_pullap",      name:"Band Pull-Aparts",                         target:"Mid/lower trapezius, posterior deltoid, ER",       desc:"Band at arm's length. Pull apart horizontally.",                             sets:3, reps:20, hold:1,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep arms straight. Squeeze blades at end range.",        progression:"Increase resistance → Face pulls → Prone Y" },
        { id:"pc_pec_foam",         name:"Pec Stretch on Foam Roller",               target:"Pectoralis major & minor, anterior capsule",       desc:"Supine on foam roller. Arms out 90°. Let gravity open chest.",               sets:1, reps:1,  hold:120,freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Relax completely. Gravity does the work.",                progression:"Increase hold → Add arm elevation → IR/ER in position" },
        { id:"pc_levator_str",      name:"Levator Scapulae Stretch",                 target:"Levator scapulae — UCS component",                 desc:"Look down 45°. Rotate head 45° away. Side bend. Gentle overpressure.",       sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Moderate", cues:"Depression of opposite shoulder increases stretch.",      progression:"Add neural component → Sustained hold → Self-SNAG" },
        { id:"pc_wall_angel",       name:"Wall Angels",                              target:"Thoracic extensors, lower trap, serratus",         desc:"Stand with back to wall (head, thoracic, pelvis, heels touching). Raise arms above head keeping contact.", sets:3, reps:10, hold:2, freq:"Daily", phase:"Phase 1", evidence:"Strong", cues:"Keep entire spine on wall throughout movement.",          progression:"Add band resistance → Add thoracic extension hold" },
        { id:"pc_brugger_relief",   name:"Brügger Relief Position",                  target:"Thoracic extensors, serratus — sitting posture",   desc:"Sit at edge of chair. Pelvis slightly anteriorly tilted. Arms ER. Breathe.", sets:3, reps:1, hold:30, freq:"Hourly",   phase:"Phase 1", evidence:"Moderate", cues:"Sit bones out. Thumbs back. Chest open. Breathe.",        progression:"Add arm raises → Use in standing" },
      ],
      "Lower Crossed Syndrome": [
        { id:"pc_lcs_bridge",       name:"Glute Activation Bridge",                  target:"Gluteus maximus — LCS pattern",                    desc:"Supine bridge with glute squeeze cue. Anterior pelvic tilt correction.",     sets:3, reps:15, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Squeeze glutes — don't just lift hips.",                  progression:"Single-leg → Resistance → Hip thrust" },
        { id:"pc_hip_flex_str",     name:"Kneeling Hip Flexor Stretch with PPT",     target:"Iliopsoas — LCS correction",                       desc:"Kneeling lunge. PPT first. Then lean forward into stretch.",                 sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Tilt pelvis first. Feel deep front of hip — not thigh.", progression:"Add thoracic rotation → RNT lunge" },
        { id:"pc_pallof",           name:"Pallof Press (Anti-Rotation)",              target:"Core anti-rotation, obliques, TA",                 desc:"Cable/band at chest height. Press out and hold 2s.",                         sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Do not rotate toward cable. Resist the pull.",            progression:"Increase resistance → Half-kneeling → Single-leg" },
        { id:"pc_hamstring_str",    name:"Hamstring Lengthening (LCS)",              target:"Hamstrings — LCS pattern",                         desc:"Supine active knee extension. PPT to remove neural. Pure hamstring.",         sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"PPT first. Focus muscular stretch.",                      progression:"Doorway stretch → Standing → Dynamic lunge stretch" },
      ],
      "Thoracic Mobility": [
        { id:"pc_foam_ext",         name:"Thoracic Extension on Foam Roller",        target:"Thoracic extensors, posterior capsule",            desc:"Foam roller across mid-thoracic. Extend over roller. Breathe.",              sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Work each segment. Support head. Breathe out.",          progression:"Add rotation → Book openings" },
        { id:"pc_book_open",        name:"Book Openings",                            target:"Thoracic rotators, pectorals",                     desc:"Side-lying, knees 90°. Top arm opens chest to ceiling.",                    sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Keep knees stacked. Let arm fall with gravity.",          progression:"Band resistance → Quadruped rotation → Standing" },
        { id:"pc_doorway_pec",      name:"Doorway Pec Minor Stretch",                target:"Pectoralis minor — forward shoulder correction",   desc:"Forearm against doorframe at 90°. Step through. Lean into stretch.",         sets:3, reps:1,  hold:30, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Feel stretch in anterior chest. Don't arch lower back.",  progression:"Bilateral → Change angle → Dynamic add shoulder IR/ER" },
      ],
    }
  },
  respiratory: {
    label:"Respiratory / Breathing", icon:"🫁", color:"#38bdf8",
    categories: {
      "Breathing Pattern Retraining": [
        { id:"resp_diaphragm",      name:"Diaphragmatic Breathing",                  target:"Diaphragm, accessory muscles — inhibition",        desc:"Supine. Hand on abdomen. Belly rises FIRST. Slow exhale.",                   sets:1, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Belly rises first — not chest. 5s in, 7s out.",          progression:"Seated → Standing → Walking → Exercise" },
        { id:"resp_lateral_costal", name:"Lateral Costal Breathing",                 target:"Intercostals, lower ribs — segmental breathing",   desc:"Hands on lower ribs. Breathe into hand resistance. Expand laterally.",       sets:1, reps:10, hold:5,  freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Breathe into the sides and back — not up.",              progression:"Add manual resistance → Respiratory snorkel" },
        { id:"resp_pursed_lip",     name:"Pursed Lip Breathing",                     target:"Respiratory — COPD/dyspnoea management",           desc:"Inhale through nose 2s. Exhale through pursed lips 4s.",                     sets:1, reps:10, hold:0,  freq:"When breathless", phase:"Phase 1", evidence:"Strong", cues:"Slow exhale — don't force. Reduces air trapping.",       progression:"During activity → Exercise → Stress management" },
        { id:"resp_4_7_8",          name:"4-7-8 Breathing",                          target:"Autonomic nervous system — pain and anxiety",      desc:"Inhale 4s, hold 7s, exhale 8s. Activates parasympathetic.",                  sets:1, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Tongue on roof of mouth. Full exhale through mouth.",     progression:"Increase to 5 cycles → Use before therapy" },
        { id:"resp_postural_breathe",name:"Breathing with Spinal Correction",        target:"Thoracic mobility + breathing integration",        desc:"Brügger position. Breathe diaphragmatically. Integrate posture and breath.", sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Posture and breathing linked. Open anterior chest.",      progression:"Add arm movements → Walking with breathing" },
      ],
      "Respiratory Strengthening": [
        { id:"resp_imst",           name:"Inspiratory Muscle Training (IMT)",        target:"Diaphragm, intercostals — inspiratory strength",   desc:"Threshold IMT device. 30% PImax. 30 breaths once daily.",                   sets:1, reps:30, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Breathe hard in against resistance. Exhale normally.",   progression:"Increase resistance 5% weekly → Sport integration" },
        { id:"resp_acbt",           name:"Active Cycle of Breathing Technique",      target:"Secretion clearance — chest physiotherapy",        desc:"Breathing control → 3–4 thoracic expansion exercises → forced expirations.", sets:3, reps:1, hold:0,  freq:"2–3×/day", phase:"Phase 1", evidence:"Strong",    cues:"Relaxed breathing first. Sniff and huff — not cough.",   progression:"Add postural drainage → Percussions → Autogenic drainage" },
      ],
    }
  },
  neurological: {
    label:"Neurological Rehab", icon:"🧠", color:"#a78bfa",
    categories: {
      "Balance & Proprioception": [
        { id:"neuro_tandem",        name:"Tandem (Heel-Toe) Walking",                target:"Vestibular, proprioception, core — balance",       desc:"Walk placing heel directly in front of toe. Maintain steady gaze.",          sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Focus on fixed point. Arms out initially.",               progression:"Eyes closed → On foam → Backward → Head turns" },
        { id:"neuro_romberg",       name:"Romberg / Sharpened Romberg",              target:"Vestibular, somatosensory — balance",              desc:"Feet together (Romberg) or heel-to-toe (Sharpened). Eyes open → closed.",    sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Safe environment. Standing frame nearby initially.",      progression:"Eyes closed → Foam surface → Perturbation" },
        { id:"neuro_foam_balance",  name:"Foam Pad Standing Balance",                target:"Proprioceptive ankle and knee — multisensory",     desc:"Stand on foam pad. Challenge balance by removing visual cues.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Arms out for assistance if needed. Near support.",        progression:"Single-leg → Head movements → Perturbation → Dual task" },
        { id:"neuro_dual_task",     name:"Dual-Task Training",                       target:"Cognitive-motor integration — falls prevention",   desc:"Walk while counting backwards, carrying object, or answering questions.",    sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Do not pause walking to think. Maintain gait.",           progression:"Increase cognitive task difficulty → Timed track" },
      ],
      "Gait Training": [
        { id:"neuro_high_step",     name:"High Stepping Gait Drill",                 target:"Hip flexors, dorsiflexors — gait pattern",         desc:"Exaggerated high knee lift during walking. Focus on clearance.",             sets:3, reps:20, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Step high. Land heel first. Maintain upright posture.",   progression:"Add treadmill → Add perturbation → Speed" },
        { id:"neuro_treadmill_bw",  name:"Body-Weight Supported Treadmill Training", target:"Lower limb motor — neurological gait",            desc:"Partial body-weight support. Repetitive gait practice.",                     sets:1, reps:1,  hold:0,  freq:"5×/week",  phase:"Phase 2", evidence:"Strongest — neuroplasticity and gait recovery", cues:"Step naturally. Reduce support progressively.",          progression:"Reduce support % → Increase speed → Overground" },
      ],
      "Motor Relearning": [
        { id:"neuro_task_practice", name:"Task-Specific Practice (Sit-to-Stand)",    target:"Motor learning — functional task",                 desc:"Repetitive sit-to-stand practice. Massed practice for neuroplasticity.",     sets:5, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 2", evidence:"Strongest", cues:"Lean forward first. Equal weight. Stand tall.",           progression:"Vary chair height → Add modifications → Single-leg STS" },
        { id:"neuro_mirror",        name:"Mirror Therapy",                           target:"Motor cortex — phantom limb / CRPS",               desc:"Mirror box. Move intact limb. Brain sees reflection as affected limb.",      sets:3, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 2", evidence:"Strong",    cues:"Focus on mirror — not on affected limb.",                progression:"Progress complexity → Virtual reality" },
      ],
    }
  },
  pelvic_floor: {
    label:"Pelvic Floor & Continence", icon:"🌸", color:"#fb7185",
    categories: {
      "Pelvic Floor Strengthening": [
        { id:"pf_kegel",            name:"Pelvic Floor Contraction (Kegel)",         target:"Levator ani, pubococcygeus — stress incontinence", desc:"Squeeze and lift pelvic floor. Hold 10s. Relax fully 10s. No breath holding.", sets:3, reps:10, hold:10, freq:"3×/day", phase:"Phase 1", evidence:"Strongest — gold standard", cues:"Squeeze UP and IN. Don't tighten buttocks or thighs.",   progression:"Increase hold → Add quick flicks → Functional positions" },
        { id:"pf_quick_flick",      name:"Quick Flick Contractions",                 target:"Type II pelvic floor fibres — urgency control",    desc:"Rapid squeeze and release. 1s on, 1s off.",                                  sets:3, reps:10, hold:0,  freq:"3×/day",   phase:"Phase 2", evidence:"Strong",    cues:"Fast on-off. No substitution patterns.",                  progression:"Increase reps → Progress to functional activities" },
        { id:"pf_functional",       name:"Pelvic Floor Bracing with Lifting",        target:"Pelvic floor + TA — load management",              desc:"Contract pelvic floor BEFORE lifting, coughing, sneezing.",                  sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"The knack — contract before the pressure.",               progression:"Increase load → Walking → Exercise" },
        { id:"pf_relaxation",       name:"Pelvic Floor Downtraining / Relaxation",   target:"Hypertonic pelvic floor — pain / vaginismus",     desc:"Diaphragmatic breath. On exhale consciously relax pelvic floor completely.", sets:3, reps:10, hold:10, freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Let go completely. Soft belly. Soft pelvic floor.",       progression:"Add visualisation → Supine → Seated → Standing" },
      ],
      "Pelvic Girdle / SIJ": [
        { id:"pf_sij_bridge",       name:"SIJ Load Transfer — Clam Bridge",          target:"Glute medius, pelvic floor — SIJ stability",      desc:"Glute bridge with resistance band. Clam hips simultaneously.",              sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Press knees against band. Squeeze glutes. Neutral spine.", progression:"Add weight → Single-leg → SIJ self-belt technique" },
        { id:"pf_abductor_iso",     name:"Hip Abductor Isometrics (SIJ)",            target:"Gluteus medius — SIJ force closure",               desc:"Side-lying or standing. Isometric abduction against wall or band.",          sets:3, reps:10, hold:10, freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"No movement. Steady force. Breathe normally.",            progression:"Isotonic clamshells → Lateral band walks" },
      ],
    }
  },
  older_adult: {
    label:"Older Adult / Frailty", icon:"👴", color:"#78716c",
    categories: {
      "Falls Prevention (Otago Programme)": [
        { id:"oa_otago_ankle",      name:"Otago — Ankle Strengthening",              target:"Ankle dorsiflexors/plantarflexors — falls prevention", desc:"Seated. Lift toes then heels repeatedly. 10 each. Progress to standing.", sets:3, reps:10, hold:2, freq:"Daily",    phase:"Phase 1", evidence:"Strongest — 35% falls reduction", cues:"Full range. Both directions. Hold surface if needed.",    progression:"Standing → Single-leg → Add ankle weights" },
        { id:"oa_otago_knee",       name:"Otago — Knee Extension",                   target:"Quadriceps — falls prevention",                    desc:"Seated. Extend knee slowly. Add ankle weight progressively.",                sets:3, reps:10, hold:2,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Full extension. Slow lowering (4s).",                     progression:"Add weight → Standing → Stair practice" },
        { id:"oa_otago_walk",       name:"Otago Walking Programme",                  target:"Gait confidence — falls prevention",                desc:"Structured walking. 3×/week, increasing 5 min monthly to 30 min.",           sets:1, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strongest", cues:"Safe footwear. Walking aid if required.",                  progression:"Increase distance → Add uneven terrain → Steps" },
        { id:"oa_stepping",         name:"Step Training / Perturbation Training",    target:"Reactive balance — falls prevention",               desc:"Rapid reactive stepping drills. Step onto targets. Perturbation catches.",   sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strong",    cues:"Near support. React — don't anticipate.",                 progression:"Increase perturbation intensity → Dual task" },
        { id:"oa_tug",              name:"Timed Up and Go (TUG) Practice",           target:"Functional mobility — gait and balance",           desc:"Rise from chair. Walk 3m. Turn. Walk back. Sit. Practice to improve.",        sets:3, reps:5, hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Normal walking aid if used. Turn safely.",                progression:"Faster → Dual task → Narrow corridor → Obstacle" },
      ],
      "Sarcopenia Prevention": [
        { id:"oa_resistance",       name:"Progressive Resistance Training (Older Adult)", target:"Muscle mass, bone density — sarcopenia",     desc:"Major muscle groups. 60–70% 1RM. 2–3 sets. 8–12 reps. 2–3×/week.",        sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 2", evidence:"Strongest", cues:"Safe technique. Slow controlled. No breath-holding.",     progression:"Increase load 5% when achieving 15 reps × 2 sets" },
        { id:"oa_power_training",   name:"Power Training (Older Adult)",             target:"Fast-twitch fibres — fall recovery speed",         desc:"Squat with faster concentric phase. Same controlled lowering.",              sets:3, reps:8,  hold:0,  freq:"2×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Fast up — slow down. Control at all times.",              progression:"Sit-to-stand fast → Power squat → Step-up fast" },
      ],
    }
  },
  sports: {
    label:"Sports Rehab & Performance", icon:"⚽", color:"#84cc16",
    categories: {
      "Return to Running": [
        { id:"sp_run_walk",         name:"Run-Walk Protocol",                        target:"Lower limb — return to sport progressive loading", desc:"Week 1: Walk 1min, run 1min ×10. Week 2: run 2min ×7. Progress weekly.",   sets:1, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Stop if NRS >3/10. 48h recovery between sessions.",       progression:"Increase run intervals → Continuous → Speed" },
        { id:"sp_plyometric",       name:"Plyometric Progression",                   target:"Lower limb — reactive strength",                   desc:"Double-leg → single-leg → lateral → rotational hops.",                      sets:3, reps:10, hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Land softly — triple flexion. Quiet feet.",               progression:"Double → Single → Lateral → Rotational → Sport-specific" },
        { id:"sp_agility",          name:"Agility & Change of Direction Drills",     target:"Lower limb — neuromuscular control, RTS",          desc:"T-test, 5-10-5, figure-8. Controlled then max speed.",                       sets:3, reps:5,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Controlled first. Quality > speed initially.",            progression:"Increase speed → Add sport ball → Reactive" },
        { id:"sp_sprinting",        name:"Sprinting Progression",                    target:"Hamstrings, glutes — RTS max velocity",            desc:"60% → 70% → 80% → 90% → 100% max velocity.",                               sets:4, reps:5,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"No pain. Full hip extension. Maintain form.",             progression:"Linear → Curved → Reactive → Sport-specific" },
      ],
      "Throwing / Upper Limb Sports": [
        { id:"sp_ir_er_ratio",      name:"IR/ER Ratio Strength Training",            target:"Rotator cuff balance — thrower's shoulder",        desc:"Maintain ER:IR strength ratio >66%. Prioritise ER.",                         sets:3, reps:15, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"External rotation is the priority for overhead athletes.", progression:"Sidelying → 90° abduction → Overhead" },
        { id:"sp_throw_prog",       name:"Interval Throwing Programme",              target:"Shoulder — return to sport throwing",              desc:"Start 30ft. Progress distance every 2 sessions if pain-free.",               sets:1, reps:25, hold:0,  freq:"Every 2nd day", phase:"Phase 3", evidence:"Strong", cues:"Stop immediately if pain. Ice after.",                    progression:"30ft → 60ft → 90ft → 120ft → Full distance" },
        { id:"sp_decel_training",   name:"Deceleration Mechanism Training",          target:"Rotator cuff posterior — deceleration phase",     desc:"Eccentric posterior cuff loading at 90/90 position. Resist forward pull.",  sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Control the deceleration — most RTC tears occur here.",  progression:"Increase resistance → Simulate throw speed → Plyoball" },
      ],
      "Strength & Conditioning": [
        { id:"sp_split_squat",      name:"Bulgarian Split Squat",                    target:"Quadriceps, glutes — unilateral strength",         desc:"Rear foot elevated. Front foot forward. Drop back knee toward floor.",       sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Front shin vertical. Drop straight down. No knee cave.", progression:"Add weight → Add deficit → Jump split squat" },
        { id:"sp_bench_press",      name:"Bench Press Progression",                  target:"Pectorals, anterior deltoid, triceps",             desc:"Barbell bench. Scapulae retracted. Controlled lowering. Drive up.",          sets:4, reps:8,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Elbows 45–75° from torso. Control descent.",             progression:"Add load → Dumbbell → Incline → Decline" },
        { id:"sp_chin_up",          name:"Chin-Up / Pull-Up Progression",            target:"Latissimus dorsi, biceps, mid trap",               desc:"Full hang to chin over bar. Control lowering. Various grips.",               sets:4, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Full range. Dead hang to start. Depress scapulae first.", progression:"Band assisted → Bodyweight → Weighted → L-sit" },
        { id:"sp_trap_bar",         name:"Trap Bar Deadlift",                        target:"Total lower chain — safe primary mover pattern",   desc:"Trap bar. Neutral spine. Full hip extension. Progressively loaded.",         sets:4, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strong",    cues:"Push floor away. Drive hips forward. Stand tall.",        progression:"Increase load → Single-leg RDL → Sumo deadlift" },
        { id:"sp_hip_ext_hamstring",name:"Hip Extension Hamstring Loading",          target:"Hamstrings in lengthened position",                desc:"Prone hip extension against resistance (band). Full hip extension.",          sets:3, reps:12, hold:2,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Keep pelvis neutral. Feel hamstring activation.",         progression:"Add weight → Nordic → Glider curl" },
        { id:"sp_nordics",          name:"Nordic Hamstring Curl",                    target:"Biceps femoris — eccentric injury prevention",     desc:"Kneel, feet anchored. Lower body slowly with hamstrings.",                   sets:3, reps:6,  hold:0,  freq:"3×/week",  phase:"Phase 3", evidence:"Strongest — 51% hamstring injury reduction", cues:"Lower as slowly as possible. Push up with hands.",        progression:"Increase reps → Add resistance → Glider curl" },
      ],
    }
  },
  pilates_yoga: {
    label:"Pilates & Yoga-Based", icon:"🧘", color:"#c084fc",
    categories: {
      "Clinical Pilates": [
        { id:"pil_imprint",         name:"Imprint and Release",                      target:"TA, pelvic stabilisers — Pilates foundation",     desc:"Supine. Find neutral pelvis. Imprint lumbar (PPT). Release. Alternate.",     sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Find neutral — not flat, not arched. Breathe.",           progression:"Add leg float → Dead bug → Full repertoire" },
        { id:"pil_hundred",         name:"The Hundred",                              target:"TA, hip flexors, core endurance — Pilates",        desc:"Supine legs tabletop/extended. Pump arms 5 in, 5 out. 10 sets = 100.",       sets:1, reps:100,hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"C-curve. Scoop navel. Arms long and strong.",             progression:"Extend legs lower → Add weight → Full Pilates series" },
        { id:"pil_roll_up",         name:"Pilates Roll-Up",                          target:"Spinal flexors, hamstrings — articulation",        desc:"Supine arms overhead. Slowly roll up sequentially through spine.",            sets:3, reps:8,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Peel spine off floor one vertebra at a time.",            progression:"Add band → Half roll back → Teaser" },
        { id:"pil_single_leg_str",  name:"Single Leg Stretch",                       target:"TA, hip flexors — Pilates core series",            desc:"Supine. Curl up. Alternate knee to chest cycling.",                          sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Scoop navel. Keep C-curve stable.",                       progression:"Add double leg → Scissors → Bicycle" },
        { id:"pil_swimming",        name:"Pilates Swimming",                         target:"Back extensors, glutes — posterior chain",         desc:"Prone. Alternate arm/leg lifts in flutter pattern. Breathe 5 in, 5 out.",    sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Lengthen — don't compress lumbar. Light rapid movement.", progression:"Hold → Add resistance → Full back extension series" },
      ],
      "Therapeutic Yoga": [
        { id:"yoga_warrior1",       name:"Warrior I (Virabhadrasana I)",             target:"Hip flexors, quadriceps, core — lower limb",       desc:"Lunge position. Back foot 45°. Hips square. Arms overhead.",                sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Square hips forward. Front knee over ankle.",             progression:"Warrior II → Warrior III → Bind variations" },
        { id:"yoga_downdog",        name:"Downward Dog",                             target:"Hamstrings, calves, thoracic, shoulder stability", desc:"Hands and feet on floor. Hips high. Press heels toward floor.",              sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Long spine. Press into hands equally. Pedal feet.",       progression:"Add leg raise → Three-legged dog → Plank flow" },
        { id:"yoga_child_pose",     name:"Child's Pose (Balasana)",                  target:"Lumbar, hip flexors, thoracic — restorative",      desc:"Kneel, sit back on heels. Arms extended forward. Rest forehead.",            sets:3, reps:1,  hold:60, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Wide knees if needed. Breathe into back.",                progression:"Add lateral stretch → Thread needle → Extended child" },
        { id:"yoga_bridge_yoga",    name:"Yoga Bridge (Setu Bandha)",                target:"Glutes, hamstrings, pelvic floor — restorative",   desc:"Supine. Feet hip-width. Press into feet. Lift hips.",                        sets:3, reps:1,  hold:30, freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Press knees forward. Lift sternum toward chin.",          progression:"Single-leg → Wheel → Add resistance" },
        { id:"yoga_cat_cow",        name:"Cat-Cow (Marjaryasana-Bitilasana)",        target:"Lumbar-thoracic mobility — segmental",             desc:"Quadruped. Flex (cat) and extend (cow) spine with breath.",                  sets:3, reps:10, hold:3,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Link to breath. Exhale cat, inhale cow.",                 progression:"Add rotation → Side bend → Bird dog integration" },
        { id:"yoga_triangle",       name:"Triangle Pose (Trikonasana)",              target:"Hip abductors, spinal lateral flexors, IT band",   desc:"Feet wide. Front toes forward. Hinge at hip. Reach front hand toward foot.", sets:3, reps:1, hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Long spine. Don't collapse trunk. Look up to top hand.", progression:"Add bind → Revolved triangle → Extended side angle" },
        { id:"yoga_tree",           name:"Tree Pose (Vrksasana)",                    target:"Hip abductors, ankle stabilisers, proprioception", desc:"Single-leg balance. Other foot on inner thigh or calf (not knee). Arms up.", sets:3, reps:1, hold:30, freq:"Daily",    phase:"Phase 2", evidence:"Moderate", cues:"Fix gaze point. Squeeze standing glute. Breathe.",        progression:"Close eyes → Arm variations → Dynamic tree" },
      ],
    }
  },
  hydrotherapy: {
    label:"Hydrotherapy / Aquatic", icon:"🏊", color:"#06b6d4",
    categories: {
      "Aquatic Rehabilitation": [
        { id:"hydro_walk",          name:"Aquatic Walking",                          target:"Lower limb — unloaded gait retraining",            desc:"Chest-deep water walking. Forward, backward, sideways. Normal gait.",        sets:3, reps:1,  hold:0,  freq:"3×/week",  phase:"Phase 1", evidence:"Strong",    cues:"Normal heel-toe gait. Arms swing naturally.",             progression:"Increase speed → Deep water → Add buoyancy resistance" },
        { id:"hydro_squat",         name:"Aquatic Squat",                            target:"Quadriceps, glutes — reduced load",                desc:"Waist-deep water. Squat as normal — water reduces load ~50%.",               sets:3, reps:15, hold:2,  freq:"3×/week",  phase:"Phase 1", evidence:"Strong",    cues:"Same form as land squat. Use buoyancy — don't fall.",     progression:"Deeper water → Add noodle resistance → Plyometric" },
        { id:"hydro_run",           name:"Deep Water Running",                       target:"Cardiovascular — offloading for injury",           desc:"Deep water with floatation belt. Running motion — no floor contact.",         sets:3, reps:1,  hold:300,freq:"3–5×/week", phase:"Phase 2", evidence:"Strong",   cues:"Upright posture. Full running pattern.",                  progression:"Increase duration → Increase intensity → Resistance bands" },
        { id:"hydro_balance",       name:"Single-Leg Balance in Water",              target:"Proprioception — aquatic reduced-load",            desc:"Single-leg stance in shallow water. Gentle wave perturbation.",              sets:3, reps:1,  hold:30, freq:"3×/week",  phase:"Phase 1", evidence:"Moderate", cues:"Near pool edge. Focus on fixed point.",                   progression:"Add reach tasks → Close eyes → Deeper water" },
        { id:"hydro_kick",          name:"Aquatic Leg Kicks / Flutter Board",        target:"Hip flexors, quadriceps, hip extensors — low load", desc:"Hold flutter board. Kick front crawl motion. Supported on water.",          sets:3, reps:1,  hold:120,freq:"3×/week",  phase:"Phase 1", evidence:"Moderate", cues:"Full hip extension on kick. Flutter — not slap.",         progression:"Increase duration → Add ankle weights → Depth change" },
      ],
    }
  },
  cardiac: {
    label:"Cardiac Rehab", icon:"❤", color:"#ef4444",
    categories: {
      "Phase 2–3 Cardiac Rehab": [
        { id:"card_walk_prog",      name:"Supervised Walking Programme",             target:"Cardiorespiratory — Phase 2 cardiac rehab",        desc:"Treadmill or overground. Start 10–15 min. Progress 5 min/week. RPE 11–13.", sets:1, reps:1,  hold:0,  freq:"5×/week",  phase:"Phase 1", evidence:"Strongest", cues:"Borg RPE 11–13 (moderate). Stop if chest pain/dizziness.", progression:"Increase duration → Add interval → Cycle/swim" },
        { id:"card_resistance",     name:"Cardiac Resistance Training",              target:"Peripheral muscle — cardiac load reduction",       desc:"Circuit training at 40–60% 1RM. 8–10 exercises. No Valsalva.",              sets:2, reps:12, hold:0,  freq:"2–3×/week", phase:"Phase 2", evidence:"Strong",   cues:"No breath-holding. Exhale on exertion. Monitor HR/BP.",  progression:"Increase reps → Increase load → Reduce rest time" },
        { id:"card_interval",       name:"High Intensity Interval Training (HIIT)", target:"VO2 max — Phase 3 cardiac (supervised only)",      desc:"4×4 min at 85–95% HRmax with 3 min active recovery. Supervised.",           sets:4, reps:1,  hold:240,freq:"3×/week",  phase:"Phase 3", evidence:"Strongest — superior VO2 gains vs MICT", cues:"Supervised only. ECG monitored. Stop if symptoms.",       progression:"Increase sessions → Unsupervised home program" },
        { id:"card_stretching",     name:"Cool-Down Stretching",                    target:"Flexibility, autonomic recovery — post-cardiac exercise", desc:"Major muscle groups. Gentle static stretching post exercise.",       sets:1, reps:1,  hold:30, freq:"5×/week",  phase:"Phase 1", evidence:"Moderate", cues:"Never skip cool-down. Gentle only. Breathe.",             progression:"Increase hold → Add mindfulness breathing" },
      ],
    }
  },
  oncology: {
    label:"Oncology Rehab", icon:"🎗", color:"#f472b6",
    categories: {
      "Cancer Fatigue Management": [
        { id:"onco_pace",           name:"Pacing and Energy Conservation",           target:"Fatigue management — cancer-related",              desc:"Break tasks. Rest before exhaustion. Energy diary.",                          sets:1, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Stop at 7/10 energy — not at exhaustion.",                progression:"Increase activity windows → ACSM cancer guidelines" },
        { id:"onco_aerobic",        name:"Supervised Aerobic Training",              target:"Cardiorespiratory fitness — cancer rehab",          desc:"Walking or cycling at moderate intensity. 150 min/week.",                    sets:1, reps:1,  hold:0,  freq:"5×/week",  phase:"Phase 2", evidence:"Strongest — reduces fatigue, improves survival", cues:"Rate exertion 5–6/10. Stop if dizzy or chest pain.",     progression:"Increase duration → Resistance training add-on" },
        { id:"onco_resistance",     name:"Progressive Resistance Training — Oncology", target:"Muscle strength — cancer cachexia prevention",   desc:"2 sets major muscle groups. 60–70% 1RM. Supervised initially.",              sets:2, reps:12, hold:0,  freq:"2–3×/week", phase:"Phase 2", evidence:"Strong",   cues:"Monitor blood counts. Avoid when neutropenic.",          progression:"Progress load 5% weekly → Functional integration" },
        { id:"onco_lymph_pump",     name:"Lymphatic Pump Exercises",                 target:"Lymphatic return — post-mastectomy / lymphoedema", desc:"Shoulder pumping. Elevation. Elbow flexion/extension. Deep breathing.",      sets:3, reps:20, hold:0,  freq:"3×/day",   phase:"Phase 1", evidence:"Strong",    cues:"Wear compression garment. Elevate limb.",                 progression:"Add progressive resistance → Decongestive therapy" },
      ],
    }
  },
  paediatric: {
    label:"Paediatric / Developmental", icon:"🧒", color:"#34d399",
    categories: {
      "Developmental Movement": [
        { id:"ped_tummy_time",      name:"Tummy Time Progression",                   target:"Cervical extensors, shoulder girdle — infant",     desc:"Prone positioning. Gradually increase duration. Support chest if needed.",   sets:5, reps:1,  hold:120,freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Never unsupervised. Start on chest, progress to floor.",  progression:"Supported → Unsupported → Pivoting → Crawling prep" },
        { id:"ped_crawling",        name:"Quadruped Crawling Pattern",               target:"Cross-pattern coordination — developmental",       desc:"Reciprocal hand and knee movements. Slow and controlled.",                   sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Opposite arm and leg together. Head up.",                 progression:"Static quadruped → Rock forward/back → Full crawl" },
        { id:"ped_sit_balance",     name:"Supported Sitting Balance",                target:"Trunk control — paediatric vestibular",            desc:"Seated on therapy ball. Apply gentle perturbations in all directions.",       sets:3, reps:10, hold:5,  freq:"Daily",    phase:"Phase 1", evidence:"Strong",    cues:"Allow child to self-correct. Reduce support gradually.",  progression:"Reduce support → Add arm/leg movements → Stand" },
        { id:"ped_jumping",         name:"Two-Footed Jump and Landing",              target:"Lower limb strength, coordination — paediatric",   desc:"Jump with both feet. Land softly. Focus on quality not distance.",           sets:3, reps:10, hold:0,  freq:"Daily",    phase:"Phase 2", evidence:"Strong",    cues:"Bend knees on landing. Quiet feet.",                      progression:"Add direction → Hop → Skip → Sport-specific" },
        { id:"ped_balance_beam",    name:"Balance Beam Walking",                     target:"Balance, proprioception — paediatric",             desc:"Walk along line or low beam. Arms out. Eyes open then closed.",              sets:3, reps:1,  hold:0,  freq:"Daily",    phase:"Phase 1", evidence:"Moderate", cues:"Look ahead. Arms out for balance.",                       progression:"Narrow beam → Eyes closed → Carry object → Backwards" },
      ],
    }
  },
};

// ── PROGRAMME_TEMPLATES ──
const PROGRAMME_TEMPLATES = {
  // Lumbar
  acute_lbp:      { label:"Acute LBP",                  exercises:["lb_tva","lb_prone_lying","lb_press_up","lb_cat_camel","lb_glute_bridge","lb_pelvic_tilt"] },
  chronic_lbp:    { label:"Chronic LBP",                 exercises:["lb_dead_bug","lb_bird_dog","lb_plank","lb_side_plank","lb_hip_hinge","pc_pallof","lb_stir_pot"] },
  disc_ext:       { label:"Disc — Extension Bias",       exercises:["lb_prone_lying","lb_press_up","lb_standing_ext","lb_tva","lb_glute_bridge"] },
  disc_flex:      { label:"Disc — Flexion Bias",         exercises:["lb_knee_chest","lb_cat_camel","lb_rotation_stretch","lb_piriformis","lb_tva"] },
  // Hip
  hip_oa:         { label:"Hip Osteoarthritis",          exercises:["hp_clam","hp_standing_abd","hp_hip_thrust","hp_90_90","hp_adductor_stretch","hp_thomas"] },
  hip_bursitis:   { label:"Greater Trochanteric Bursitis", exercises:["hp_clam","hp_lat_walk","hp_monster_walk","hp_ober_stretch","hp_standing_abd"] },
  groin_strain:   { label:"Groin / Adductor Strain",    exercises:["lb_copenhagen","hp_adductor_stretch","hp_side_step_squat","hp_hip_flex_raise","hp_hip_thrust"] },
  // Knee
  pfps:           { label:"Patellofemoral Pain",         exercises:["kn_tqe","kn_vmo_squat","kn_step_down","hp_clam","hp_lat_walk","lb_glute_bridge"] },
  patella_tend:   { label:"Patellar Tendinopathy",       exercises:["kn_isometric_wall","kn_slow_squat","kn_decline_squat","hp_hip_thrust","kn_rdl"] },
  acl_early:      { label:"ACL Rehab — Early Phase",     exercises:["kn_quad_set","kn_straight_leg","kn_tqe","lb_glute_bridge","kn_acl_balance"] },
  acl_late:       { label:"ACL Rehab — Return to Sport", exercises:["kn_vmo_squat","kn_step_down","kn_drop_jump","sp_plyometric","sp_agility","sp_nordics"] },
  knee_oa:        { label:"Knee Osteoarthritis",         exercises:["kn_quad_set","kn_straight_leg","kn_sit_to_stand","kn_leg_press","lb_glute_bridge","ank_calf_raise"] },
  hamstring_str:  { label:"Hamstring Strain Rehab",      exercises:["kn_hamstring_str","kn_rdl","sp_hip_ext_hamstring","kn_nordic","sp_nordics","sp_sprinting"] },
  // Ankle & Foot
  ankle_sprain:   { label:"Ankle Sprain Rehab",          exercises:["ank_single_leg","ank_peroneal","ank_calf_raise","ank_tibialis_ant","ank_reach_sebt","ank_lateral_hops"] },
  achilles:       { label:"Achilles Tendinopathy",       exercises:["ank_isometric_calf","ank_ec_drop","ank_heavy_slow_calf","ank_single_leg","ank_calf_raise"] },
  plantar_fascia: { label:"Plantar Fasciitis",           exercises:["ank_pf_stretch","ank_calf_stretch","ank_short_foot","ank_marble_pickup","ank_single_leg"] },
  // Shoulder
  shoulder_imp:   { label:"Shoulder Impingement",        exercises:["sh_wall_slide","sh_prone_ytw","sh_face_pull","sh_er_band","sh_pec_stretch","sh_ir_stretch"] },
  frozen_shoulder:{ label:"Frozen Shoulder",             exercises:["sh_pendulum","sh_pully","sh_capsule_stretch","sh_ir_stretch","sh_er_band"] },
  rct_tear:       { label:"Rotator Cuff Tear Rehab",     exercises:["sh_pendulum","sh_er_band","sh_sidelying_ir","sh_prone_ytw","sh_rhythmic_stab"] },
  // Elbow
  tennis_elbow:   { label:"Tennis Elbow",                exercises:["el_isometric_ext","el_tyler_twist","el_wrist_ext_isoton","el_grip_strength"] },
  golfers_elbow:  { label:"Golfer's Elbow",              exercises:["el_wrist_flex_iso","el_wrist_flex_eccen","el_forearm_stretch","el_pron_sup"] },
  // Cervical
  cervicogenic_ha:{ label:"Cervicogenic Headache",       exercises:["cx_dnf","cx_chin_tuck","cx_scap_ret","pc_ucs_chin","cx_suboccip_release","cx_isometric"] },
  cervical_rad:   { label:"Cervical Radiculopathy",      exercises:["cx_chin_tuck","cx_neural_slider","cx_neural_ulnar","cx_neural_radial","cx_dnf","cx_isometric"] },
  // Posture
  ucs:            { label:"Upper Crossed Syndrome",      exercises:["cx_chin_tuck","pc_ucs_chin","pc_band_pullap","pc_pec_foam","sh_wall_slide","sh_prone_ytw","pc_wall_angel"] },
  lcs:            { label:"Lower Crossed Syndrome",      exercises:["pc_lcs_bridge","pc_hip_flex_str","lb_tva","lb_bird_dog","lb_hip_flexor","lb_glute_bridge","pc_pallof"] },
  // Thoracic
  thoracic_mob:   { label:"Thoracic Stiffness",          exercises:["tx_foam_ext","tx_book_open","tx_quadruped_rot","tx_thread_needle","tx_prone_cobra","tx_seated_row"] },
  // Pelvic floor
  stress_incont:  { label:"Stress Incontinence",         exercises:["pf_kegel","pf_quick_flick","pf_functional","lb_glute_bridge","hp_clam"] },
  pelvic_pain:    { label:"Pelvic Girdle Pain",          exercises:["pf_sij_bridge","pf_abductor_iso","pf_kegel","lb_bird_dog","lb_tva"] },
  // Respiratory
  copd:           { label:"COPD Breathing",              exercises:["resp_pursed_lip","resp_diaphragm","resp_lateral_costal","resp_imst","card_walk_prog"] },
  // Older adult
  falls_prev:     { label:"Falls Prevention",            exercises:["oa_otago_ankle","oa_otago_knee","oa_stepping","oa_tug","oa_otago_walk","neuro_foam_balance"] },
  frailty:        { label:"Frailty / Sarcopenia",        exercises:["oa_resistance","oa_power_training","oa_otago_ankle","kn_sit_to_stand","lb_glute_bridge"] },
  // Sports
  return_run:     { label:"Return to Running",           exercises:["sp_run_walk","sp_plyometric","sp_agility","sp_sprinting","kn_drop_jump","kn_rdl"] },
  throwing_rts:   { label:"Return to Throwing",          exercises:["sp_ir_er_ratio","sp_throw_prog","sp_decel_training","sh_prone_ytw","sh_rhythmic_stab"] },
  // Pilates / Yoga
  clinical_pilates:{ label:"Clinical Pilates Core",      exercises:["pil_imprint","pil_hundred","pil_single_leg_str","pil_swimming","lb_bird_dog","pil_roll_up"] },
  yoga_back:      { label:"Yoga for Back Pain",          exercises:["yoga_cat_cow","yoga_child_pose","yoga_bridge_yoga","yoga_downdog","lb_piriformis","lb_rotation_stretch"] },
  // Neuro
  neuro_balance:  { label:"Neurological Balance",        exercises:["neuro_tandem","neuro_romberg","neuro_foam_balance","neuro_dual_task","oa_stepping"] },
  // Cardiac
  cardiac_phase2: { label:"Cardiac Rehab Phase 2",       exercises:["card_walk_prog","card_resistance","card_stretching","resp_diaphragm"] },
  // Hydrotherapy
  aquatic_rehab:  { label:"Aquatic Rehabilitation",      exercises:["hydro_walk","hydro_squat","hydro_balance","hydro_run","hydro_kick"] },
};

// ── ALL_EXERCISES ──
const ALL_EXERCISES = Object.values(EXERCISE_DB).flatMap(region =>
  Object.values(region.categories).flatMap(cat => cat)
);

// ── KNEE_PROTOCOLS ──
const KNEE_PROTOCOLS = [
  {
    id:"knee_oa",
    label:"Knee Osteoarthritis",
    icon:"🦴",
    color:"#ffb300",
    evidence:"NICE 2022 / OARSI Guidelines",
    phases:[
      {
        phase:"Phase 1 — Pain Control & Activation (Weeks 1–3)",
        color:"#00c97a",
        exercises:[
          { name:"Quadriceps Setting (Quad Sets)", sets:3, reps:15, hold:5, freq:"3×/day", desc:"Lie flat. Tighten quad by pushing knee into bed. Hold 5s. VMO activation without joint load. Essential first step post-flare.", cues:"Feel the quad tighten above the kneecap. No movement needed.", evidence:"Strong — initiates VMO in swollen/inhibited knee" },
          { name:"Straight Leg Raise (SLR)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Lie flat. Tighten quad first, then raise leg to 45°. Hold 2s. Lower slowly. Strengthens quad without knee compression.", cues:"Lock the knee fully before lifting. Slow return.", evidence:"Strong — safe VMO loading in early OA" },
          { name:"Inner Range Quads (IRQ)", sets:3, reps:15, hold:5, freq:"Daily", desc:"Seated, place rolled towel under knee. Extend leg from 30° to full extension. Targets VMO specifically in the last 30° of extension.", cues:"Squeeze the quad hard at the top. Hold 5 seconds.", evidence:"Strong — VMO isolation in terminal extension" },
          { name:"Ankle Pumps + Calf Raises (seated)", sets:3, reps:20, hold:0, freq:"Hourly", desc:"Seated. Pump ankles × 20, then rise onto toes × 20. Circulation and calf pump for swelling management.", cues:"Keep heels down for pumps. Rise tall for calf raises.", evidence:"Strong — oedema management in acute OA flare" },
        ]
      },
      {
        phase:"Phase 2 — Strength & Load (Weeks 4–8)",
        color:"#ffb300",
        exercises:[
          { name:"Terminal Knee Extension (TKE) — Band", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band behind knee, loop fixed. Stand in slight knee bend. Extend knee against band resistance. Last 30° of extension. Best VMO exercise in weight-bearing.", cues:"Push knee straight slowly. Hold 2s. Control return. Don't hyperextend.", evidence:"Strong — VMO in functional WB position" },
          { name:"Wall Slide / Mini Squat (0–45°)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Back against wall. Slide down to 45° ONLY (avoid deep knee bend in OA). Weight even. Functional quad load within pain-free range.", cues:"Knees track over 2nd toe. Equal weight both feet. Stop at 45°.", evidence:"Strong — OARSI recommended OA exercise" },
          { name:"Step-Up (small step — 10cm)", sets:3, reps:12, hold:1, freq:"Daily", desc:"Step up with affected leg leading. Full knee extension at top. Eccentric control on the way down (3s lower). Functional strength and proprioception.", cues:"Push through the heel. Knee over 2nd toe. Lower slowly — this is where strength builds.", evidence:"Strong — functional quad + glute loading" },
          { name:"Seated Knee Extension (limited arc 90°–30°)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Seated. Extend knee from 90° to 30° only (avoid 0° full extension if painful PF). Control through arc. Can add light ankle weight.", cues:"Slow control both ways. Stop before full extension if PF pain occurs.", evidence:"Moderate — targeted VMO with PF protection" },
          { name:"Hip Abduction Sidelying — Glute Med", sets:3, reps:20, hold:1, freq:"Daily", desc:"Sidelying, slight hip extension. Abduct leg 30°. Hold 1s. Glute med weakness causes knee valgus in OA — must address.", cues:"Toes pointing slightly down (hip in slight IR). Don't rotate pelvis.", evidence:"Strong — knee valgus control reduces medial OA load" },
          { name:"Static Cycling", sets:1, reps:0, hold:0, freq:"20–30 min daily", desc:"Low resistance cycling. Seat high (slight knee flexion at bottom). Best cardio for knee OA — low impact, ROM maintenance, quad strengthening.", cues:"Seat high enough that knee bends only 15–20° at bottom of stroke. No pain.", evidence:"Strong — NICE 2022 recommended aerobic exercise" },
        ]
      },
      {
        phase:"Phase 3 — Function & Long Term (Weeks 9+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Single-Leg Press (45° — partial range)", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Leg press machine. Single leg. 0–60° range. Progressive load. Best gym exercise for OA — controls range, loads quad and glute.", cues:"Don't lock the knee at full extension. Push through heel.", evidence:"Strong — progressive overload for OA" },
          { name:"Lateral Step-Down (eccentric control)", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Stand on step. Lower non-affected foot slowly toward floor (3–5s). Eccentric quad + hip control. Hardest functional exercise for knee.", cues:"Knee tracks over 2nd toe. Pelvis level. Count 4 seconds down.", evidence:"Strong — functional eccentric control" },
          { name:"Walking Programme — Progressive", sets:1, reps:0, hold:0, freq:"Daily", desc:"Start: 10 min flat surface. Progress 10% per week. Target: 30 min continuous. Best long-term intervention for knee OA.", cues:"Comfortable footwear. Flat surface initially. Slight knee ache OK. Sharp pain: stop.", evidence:"Strong — NICE 2022 / OARSI top recommendation" },
          { name:"Aquatic Exercise (hydrotherapy)", sets:3, reps:15, hold:0, freq:"2×/wk", desc:"Pool exercises — walking in water, leg raises, mini squats in water. Offloads 50% body weight. Ideal for BMI>30 or severe OA.", cues:"Warm water preferred. Buoyancy reduces load. Can do deeper squats safely.", evidence:"Strong — Cochrane review: significant pain reduction" },
        ]
      },
    ],
    treatment:[
      { name:"Manual Therapy — Tibiofemoral Joint Mobilisation", desc:"Maitland Grade III–IV. Posterior glide of tibia on femur. Increases joint mobility, reduces pain neurologically. 3–5 min per session.", evidence:"Moderate — Cochrane: short-term pain relief" },
      { name:"Patellar Taping (McConnell)", desc:"Medial glide tape for lateral PF pain. Apply before exercise. Reduces pain by 50%+ acutely, allows therapeutic exercise.", evidence:"Strong — McConnell 1986, multiple RCTs confirmed" },
      { name:"TENS / Electrotherapy", desc:"TENS: 80–100 Hz for pain relief pre-exercise. IFT: 4000 Hz carrier, 80–120 Hz beat for deeper penetration. 20 min.", evidence:"Moderate — short-term pain relief to enable exercise" },
      { name:"Heat (pre-exercise)", desc:"Hot pack to knee 15–20 min before exercise. Reduces stiffness, improves ROM, increases tissue extensibility.", evidence:"Moderate — best combined with exercise" },
      { name:"Ice (post-exercise)", desc:"Ice pack 15 min post-exercise if swelling or warmth. Reduces post-exercise effusion. Essential after land-based exercise in acute OA.", evidence:"Strong — standard post-exercise OA management" },
      { name:"Knee Bracing / Offloading", desc:"Valgus unloader brace for medial compartment OA. Reduces medial load 20–25%. Use for activity, not 24/7.", evidence:"Moderate — OARSI recommended for medial OA" },
    ]
  },
  {
    id:"knee_pfps",
    label:"Patellofemoral Pain (PFPS)",
    icon:"🔵",
    color:"#7f5af0",
    evidence:"Crossley et al 2016 / BJSM Consensus",
    phases:[
      {
        phase:"Phase 1 — Load Reduction & VMO (Weeks 1–4)",
        color:"#00c97a",
        exercises:[
          { name:"VMO Isolation — Inner Range Quads", sets:3, reps:20, hold:5, freq:"Daily", desc:"Towel under knee at 30°. Contract VMO (feel above inner kneecap). Extend to full. VMO fires last 30° — most important phase for PF tracking.", cues:"Place fingers on VMO (inner quad, above knee). Feel it fire. Hold 5s.", evidence:"Strong — VMO retraining primary for PFPS" },
          { name:"Straight Leg Raise (SLR)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Quad set first, then raise to 45°. Safe loading without PF compression. Foundation exercise.", cues:"Tighten quad before lifting. No knee flexion during movement.", evidence:"Strong — PFPS phase 1 standard" },
          { name:"Clam Exercise — Glute Med", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying, hips slightly extended. Rotate top knee up (clamshell). Hip ext position isolates glute med, not TFL. Reduces knee valgus = reduces lateral PF tracking.", cues:"Hips slightly behind (not flexed). Open slowly. Band around knees optional.", evidence:"Strong — hip abductor weakness primary driver of PFPS" },
          { name:"Hip External Rotation — Sidelying", sets:3, reps:15, hold:2, freq:"Daily", desc:"Sidelying. ER hip while keeping pelvis stable. Activates posterior glute med + piriformis. Reduces femoral IR = reduces Q-angle = reduces lateral PF load.", cues:"Pelvis stays stacked. Only the hip moves. Small movement, big contraction.", evidence:"Strong — BJSM consensus: hip ER training for PFPS" },
        ]
      },
      {
        phase:"Phase 2 — Functional Loading (Weeks 5–10)",
        color:"#ffb300",
        exercises:[
          { name:"TKE with Band (VMO in WB)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band behind knee. Stand. Extend knee from 30° against band. Most functional VMO exercise — weight bearing position.", cues:"Push knee back slowly. Squeeze VMO at end. Don't hyperextend.", evidence:"Strong — VMO in functional position" },
          { name:"Step-Up (low step 10cm) — Eccentric focus", sets:3, reps:15, hold:0, freq:"Daily", desc:"Step up, then lower for 4s (eccentric control is key for PFPS). Trains VMO + hip control in functional pattern.", cues:"Lower: 4 seconds, knee over 2nd toe. Don't let knee fall in.", evidence:"Strong — eccentric control reduces PF load" },
          { name:"Wall Squat with Ball (knees out)", sets:3, reps:15, hold:3, freq:"Daily", desc:"Wall slide with pilates ball between knees. Squeeze ball to activate adductors/VMO. Limits knee valgus. 0–60° only for PFPS.", cues:"Squeeze ball, press knees outward, back flat on wall. 60° max.", evidence:"Strong — VMO + medial loading for PF tracking" },
          { name:"Single-Leg Balance (eyes closed progression)", sets:3, reps:0, hold:30, freq:"Daily", desc:"Stand single leg 30s. Progression: eyes closed, unstable surface. Proprioception training essential for PFPS (retinacular mechanoreceptors).", cues:"Soft knee, not locked. Feel subtle corrections in foot. Progress to wobble board.", evidence:"Strong — proprioception training reduces PFPS recurrence" },
          { name:"Cycling (seat high)", sets:1, reps:0, hold:0, freq:"20 min daily", desc:"Stationary bike, seat high. Limits PF compression. Excellent aerobic base + quad without high PF load.", cues:"Seat height: knee slightly bent at bottom. No pain with pedalling.", evidence:"Strong — low PF load, high quad activation" },
        ]
      },
      {
        phase:"Phase 3 — Return to Sport / Running (Weeks 10+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Lateral Step-Down — Eccentric", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Single leg eccentric squat to step. Most demanding PFPS exercise. Only introduce when pain <2/10 with phase 2 exercises.", cues:"4 seconds lower. Knee over 2nd toe. Pelvis level. Stop if PF pain >3/10.", evidence:"Strong — functional return to sport criterion" },
          { name:"Running Gait Retraining", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"10% cadence increase (Garmin/metronome). Reduces PF load 20–30%. Forefoot/midfoot strike if appropriate. Gradual return to run programme.", cues:"Count steps: aim 170–180 steps/min. Lighter footfall. Shorter stride.", evidence:"Strong — Bramah et al 2019: gait retraining #1 PFPS intervention" },
          { name:"Decline Squat Progression", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Squat on 25° decline board. Increases PF loading progressively. Tendon loading preparation for sport. Introduce only when pain <2/10.", cues:"Heels elevated on board. Slow control down. Pain-free only.", evidence:"Moderate — load progression for patellar tendon and PF" },
        ]
      },
    ],
    treatment:[
      { name:"Patellar Taping — McConnell (medial glide)", desc:"Tape patella medially before all exercises. Reduces lateral PF pressure immediately. Retrains VMO by reducing pain inhibition.", evidence:"Strong — McConnell 1986, multiple RCTs" },
      { name:"Patellar Mobilisation (medial glide)", desc:"Grade III medial patellar glide. 3 × 30 sec. Stretches tight lateral retinaculum. Reduces lateral PF tracking.", evidence:"Moderate — combined with exercise: strong evidence" },
      { name:"Foot Orthoses (if overpronation present)", desc:"Semi-rigid off-the-shelf orthotics if navicular drop >6mm or rearfoot valgus. Reduces tibial IR and Q-angle indirectly.", evidence:"Moderate — Collins et al 2008 RCT: orthotics + exercise > exercise alone" },
      { name:"Dry Needling — Vastus Lateralis", desc:"DN to lateral quad + TFL if overactive (NKT confirmed). Reduces lateral retinacular tension improving PF tracking.", evidence:"Moderate — VL inhibition improves medial tracking" },
      { name:"Soft Tissue — IT Band / TFL", desc:"Foam roll TFL × 90 sec. Cross-fibre massage lateral retinaculum. Reduces lateral pull on patella.", evidence:"Moderate — adjunct to exercise" },
    ]
  },
  {
    id:"knee_hamstring",
    label:"Hamstring Tendinopathy",
    icon:"🟡",
    color:"#ffb300",
    evidence:"Purdam / Rio / Goom 2016",
    phases:[
      {
        phase:"Phase 1 — Load Management (Weeks 1–3)",
        color:"#00c97a",
        exercises:[
          { name:"Isometric Hamstring Hold", sets:5, reps:1, hold:45, freq:"Daily", desc:"Prone, knee 30°. Push foot into therapist hand (or wall). Isometric hold 45s × 5 reps. Best pain relief in acute tendinopathy.", cues:"No movement. Just push and hold. Pain 0–3/10 acceptable.", evidence:"Strong — Rio et al 2015: isometrics reduce tendon pain immediately" },
          { name:"Prone Hip Extension (glute dominant)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Prone. Extend hip with knee bent 90°. Activates glute max > hamstring. Offloads tendon while maintaining neural drive.", cues:"Squeeze glute. Feel the glute, not the hamstring. Knee stays at 90°.", evidence:"Strong — glute loading offloads proximal hamstring" },
        ]
      },
      {
        phase:"Phase 2 — Isotonic Loading (Weeks 4–8)",
        color:"#ffb300",
        exercises:[
          { name:"Deadlift (Romanian — hip hinge)", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Hip hinge pattern. Load through hip, not lumbar spine. Progresses from bodyweight to dumbbell. Primary hamstring tendon loading exercise.", cues:"Hinge at hip. Feel tension in hamstrings before lowering. Flat back.", evidence:"Strong — Goom et al 2016: progressive loading for proximal hamstring tendinopathy" },
          { name:"Bridge — Single Leg (slow eccentric)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Single leg bridge with 3s eccentric lower. Hip at full extension loads hamstring-glute junction. Progress: straight leg (hamstring dominant).", cues:"Push through heel. Squeeze glute at top. Lower for 3 seconds.", evidence:"Strong — hamstring-glute loading in functional position" },
          { name:"Leg Curl — Prone (isotonic)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Prone leg curl machine. Full range, slow eccentric (3s). Isolated hamstring load. Important for distal tendon.", cues:"Control the return — 3 seconds lower. Don't let the weight drop.", evidence:"Strong — eccentric bias for tendinopathy" },
        ]
      },
      {
        phase:"Phase 3 — Functional & Return to Sport (Weeks 8+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Nordic Hamstring Curl", sets:3, reps:6, hold:0, freq:"2×/wk", desc:"Kneel, feet anchored. Lower body as slow as possible (eccentric). Most powerful hamstring strengthening exercise. Reduces hamstring injury 51%.", cues:"Go as slow as possible. Use hands to catch at bottom. Pull yourself back up.", evidence:"Strong — Petersen et al 2011: 51% injury reduction" },
          { name:"Hip Thrust with Bar (heavy)", sets:4, reps:8, hold:1, freq:"3×/wk", desc:"Barbell hip thrust. Full hip extension load. Targets glute max + hamstring junction. Progress to >80% body weight.", cues:"Full hip extension at top. Squeeze glute. Chin tucked. Drive through heels.", evidence:"Strong — high glute-ham loading for return to sprint" },
          { name:"Sprinting — Progressive", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Start 50% speed × 6 reps × 30m. Progress 10%/week. Pain <2/10. Do NOT sprint through pain.", cues:"Warm up well. First sprint always easy. Stop if any twinge at proximal hamstring.", evidence:"Strong — sport-specific loading final stage" },
        ]
      },
    ],
    treatment:[
      { name:"Load Management (CRITICAL)", desc:"Avoid sustained hip flexion (sitting >20 min, stretching hamstrings). This compresses proximal tendon at ischial tuberosity. Sit on edge of chair or use cushion.", evidence:"Strong — tendon compression is primary driver of symptoms" },
      { name:"Shockwave Therapy (ESWT)", desc:"Radial ESWT × 2000 pulses × 3 sessions, 1 week apart. Applied directly to ischial tuberosity. Best for chronic (>3 months) proximal hamstring tendinopathy.", evidence:"Strong — Furia 2009, multiple RCTs" },
      { name:"Gluteal Dry Needling", desc:"DN to glute max + piriformis if overactive NKT pattern. Reduces compression on proximal hamstring from tight external rotators.", evidence:"Moderate — adjunct for compressed tendinopathy" },
    ]
  },
  {
    id:"knee_acl",
    label:"ACL Rehab (Post-Op / Conservative)",
    icon:"🔴",
    color:"#ff4d6d",
    evidence:"MOON / KANON / Ardern et al 2014",
    phases:[
      {
        phase:"Phase 1 — Acute Control (Weeks 1–2)",
        color:"#00c97a",
        exercises:[
          { name:"Quad Sets (VMO re-activation)", sets:3, reps:20, hold:5, freq:"Hourly", desc:"Immediate post-op VMO reactivation. AMI (arthrogenic muscle inhibition) shuts down VMO after ACL injury/surgery. This is the priority.", cues:"Push knee into bed. Feel VMO fire above kneecap. Hold 5s. Relax.", evidence:"Strong — AMI reversal is Phase 1 priority" },
          { name:"Heel Slides (ROM recovery)", sets:3, reps:20, hold:1, freq:"3×/day", desc:"Supine. Slide heel toward buttock. Regain flexion ROM gently. Target 90° by week 2. Avoid forced flexion.", cues:"Slide slowly. Stop at resistance or pain >3/10. Ice after.", evidence:"Strong — ROM recovery pacing post ACL-R" },
          { name:"SLR (straight leg raise)", sets:3, reps:15, hold:2, freq:"Daily", desc:"VMO-locked SLR. Quad control without knee flexion. Safe immediately post-op. Prevents extensor lag.", cues:"Fully tighten quad before lifting. If leg bends = quad not firing enough.", evidence:"Strong — prevents extensor lag post ACL-R" },
          { name:"Ankle Pumps + Calf Raises", sets:0, reps:20, hold:0, freq:"Hourly", desc:"DVT prevention. Hourly in first 2 weeks. Foot/ankle pump circulation.", cues:"Pump ankles × 20 then point and hold. Do every hour when awake.", evidence:"Strong — DVT prophylaxis post surgery" },
        ]
      },
      {
        phase:"Phase 2 — Strength Foundation (Weeks 3–12)",
        color:"#ffb300",
        exercises:[
          { name:"Leg Press (double to single leg)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Start double leg, progress to single. 0–70° only initially (avoid 0° full ext if graft tension issue). Progress load weekly.", cues:"Push through heel. Full control both ways. Progress range as tolerated.", evidence:"Strong — primary quad + glute loading post ACL-R" },
          { name:"TKE — Terminal Knee Extension (band)", sets:3, reps:20, hold:2, freq:"Daily", desc:"VMO in weight-bearing. Band behind knee. Extend against resistance. Most important VMO exercise in early rehab.", cues:"Slow push. Hold at extension 2s. Don't snap knee back.", evidence:"Strong — VMO in functional WB position" },
          { name:"Hip Abduction + Hip ER (sidelying)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Hip rehab must run alongside knee rehab from day 1. Glute weakness = valgus collapse = graft stress.", cues:"Controlled movement. Pelvis stable. Feel the outer glute.", evidence:"Strong — hip rehab concurrent with knee for ACL" },
          { name:"Step-Up (10cm to 20cm)", sets:3, reps:12, hold:1, freq:"Daily", desc:"Functional loading progression. Start 10cm step. Eccentric control critical. Progress height as strength improves.", cues:"4 second lower. Knee over 2nd toe. Pelvis level.", evidence:"Strong — functional quad loading ACL rehab" },
          { name:"Proprioception — Single Leg Balance", sets:3, reps:0, hold:30, freq:"Daily", desc:"Re-establish mechanoreceptor function in ACL-deficient/reconstructed knee. Progress: eyes closed, perturbation, wobble board.", cues:"Soft knee. React to perturbations. Progress difficulty weekly.", evidence:"Strong — proprioception retraining reduces re-injury risk" },
        ]
      },
      {
        phase:"Phase 3 — Return to Sport (Months 4–9)",
        color:"#ff4d6d",
        exercises:[
          { name:"Nordic Hamstring Curl", sets:3, reps:6, hold:0, freq:"2×/wk", desc:"Hamstring strength >= 80% of quad (H:Q ratio). Nordic curl builds hamstring as secondary ACL restraint. Cannot return to sport without adequate H:Q ratio.", cues:"Slow as possible. Build tolerance. Full programme takes 6 weeks.", evidence:"Strong — H:Q ratio normalisation for ACL return to sport" },
          { name:"Plyometric Progression (hop tests)", sets:3, reps:8, hold:0, freq:"3×/wk", desc:"Double leg to single leg to tuck jumps to lateral hops. LSI (limb symmetry index) must be >90% before RTS. Hop test battery: single hop, triple hop, crossover hop.", cues:"Soft landing. Knee over toe. Quiet landing = good absorption. Loud = poor control.", evidence:"Strong — Ardern et al: LSI >90% required for safe RTS" },
          { name:"Running Programme — Return to Run", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Criteria for running: full ROM, no effusion, quad strength >70% contralateral. Start: walk-jog intervals × 20 min. Progress weekly. No cutting/pivoting until month 6.", cues:"Pain <2/10. No swelling after. Increase volume before intensity.", evidence:"Strong — progressive return to run protocol" },
          { name:"Agility + Change of Direction", sets:3, reps:6, hold:0, freq:"3×/wk", desc:"T-drill, lateral shuffle, figure-8. Introduce at month 6+ only. Neuromuscular control under speed.", cues:"Start slow. Accelerate when technique is clean. Video from front for valgus check.", evidence:"Strong — sport-specific neuromuscular training pre-RTS" },
        ]
      },
    ],
    treatment:[
      { name:"Cryotherapy (Ice) — Phase 1", desc:"Ice × 15–20 min every 2 hours for first 2 weeks. Reduces post-op effusion which drives VMO inhibition (AMI).", evidence:"Strong — effusion management = VMO inhibition reversal" },
      { name:"Neuromuscular Electrical Stimulation (NMES)", desc:"NMES to VMO while doing quad sets. Enhances VMO firing in AMI. Use for first 4 weeks post-op.", evidence:"Strong — Hauger et al 2018: NMES accelerates VMO return" },
      { name:"Graft Healing Timeline (CRITICAL education)", desc:"Ligamentisation phase 3–6 months (weakest point). Patient MUST understand graft is weaker at 3 months than immediately post-op. No RTS before 9 months (re-injury risk halved vs 6 months).", evidence:"Strong — Grindem et al 2016: 9 months RTS = 51% re-injury reduction" },
      { name:"Psychological Readiness (ACL-RSI)", desc:"Use ACL-RSI questionnaire. Fear of re-injury = primary barrier to RTS. Address with graded exposure and self-efficacy building.", evidence:"Strong — Ardern et al: psychological readiness = RTS outcome predictor" },
    ]
  },
  {
    id:"knee_it_band",
    label:"IT Band Syndrome (ITBS)",
    icon:"🟠",
    color:"#ff6b35",
    evidence:"Fairclough 2006 / Weckstrom 2016",
    phases:[
      {
        phase:"Phase 1 — Load Reduction (Weeks 1–3)",
        color:"#00c97a",
        exercises:[
          { name:"Hip Abduction — Sidelying (glute med)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Primary exercise for ITBS. Glute med weakness = excessive hip adduction = increased IT band tension. Sidelying, hip slightly extended.", cues:"Toes slightly down. Lift 30°. Hold 2s. Don't flex hip.", evidence:"Strong — hip abductor weakness primary cause of ITBS" },
          { name:"Clam — with Band", sets:3, reps:25, hold:1, freq:"Daily", desc:"Clamshell with resistance band above knees. Glute med + ER activation. Hip in slight extension (crucial for glute, not TFL).", cues:"Band just above knees. Hip slightly behind trunk. Rotate slowly.", evidence:"Strong — glute med isolation for ITBS" },
          { name:"Single Leg Balance (proprioception)", sets:3, reps:0, hold:30, freq:"Daily", desc:"Running injury = proprioception failure. Single leg stance. Progress: slight knee bend (30°), eyes closed, surface perturbation.", cues:"Slight knee bend. React to balance challenge. Head up, look forward.", evidence:"Strong — proprioception retraining for runners" },
        ]
      },
      {
        phase:"Phase 2 — Strength & Running Reintroduction (Weeks 4–8)",
        color:"#ffb300",
        exercises:[
          { name:"Lateral Band Walk", sets:3, reps:20, hold:0, freq:"Daily", desc:"Band above knees. Side step in slight squat. Glute med + hip control in weight-bearing. Best pre-run activation drill.", cues:"Stay low. Steps sideways. Knees pushing against band throughout.", evidence:"Strong — functional glute med activation before running" },
          { name:"Single-Leg Squat (5cm step)", sets:3, reps:12, hold:2, freq:"Daily", desc:"Stand on 5cm step. Single leg squat to 30°. Control knee valgus. This is the key functional test AND exercise for ITBS.", cues:"Knee straight over 2nd toe. Pelvis level. Stop if valgus occurs.", evidence:"Strong — functional hip + quad loading for ITBS" },
          { name:"Running Cadence Increase (10%)", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Increase running cadence 10% using metronome (app). Reduces hip adduction and stride length — directly reduces IT band tension.", cues:"Count steps. Use metronome app. Smaller, quicker steps. Same pace.", evidence:"Strong — Noehren 2011: cadence increase reduces IT band load 19%" },
          { name:"Downhill Avoidance + Gradual Return", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"ITBS is worse downhill (IT band compresses at 30° flexion). Avoid hills for 6 weeks. Return flat first, gentle hills last.", cues:"Start flat. Treadmill incline 0%. Add hills at week 8 only.", evidence:"Strong — load management for IT band impingement" },
        ]
      },
    ],
    treatment:[
      { name:"TFL / IT Band Foam Roll", desc:"Foam roll lateral thigh 90 sec. NOT directly on IT band (too painful). Roll TFL at hip more than band itself. 2× daily.", evidence:"Moderate — reduces TFL tone, indirect IT band tension relief" },
      { name:"Hip Flexor Stretch (couch stretch)", desc:"Couch stretch × 3 × 60 sec. Tight hip flexors increase anterior pelvic tilt = increased IT band tension.", evidence:"Moderate — hip flexor length restoration" },
      { name:"Corticosteroid Injection (acute severe)", desc:"Ultrasound-guided injection into IT band bursa at lateral epicondyle. Consider if pain >6/10, unable to exercise. One injection only — does not fix cause.", evidence:"Moderate — short term pain relief only. Must combine with exercise." },
    ]
  },
  {
    id:"knee_patellar_tendon",
    label:"Patellar Tendinopathy",
    icon:"⚡",
    color:"#00c97a",
    evidence:"Purdam 2004 / Kongsgaard 2009 / Rio 2015",
    phases:[
      {
        phase:"Phase 1 — Pain Control (Weeks 1–4)",
        color:"#00c97a",
        exercises:[
          { name:"Isometric Leg Extension (70° knee bend)", sets:5, reps:1, hold:45, freq:"Daily (pre-sport)", desc:"Leg extension machine. Knee at 70°. Push maximally without moving. 45 second hold. Immediate analgesia effect (10 min). Do before training.", cues:"Maximum effort push. No movement. 45 seconds. Pain 0–4/10 acceptable.", evidence:"Strong — Rio et al 2015: isometrics = pain relief + cortical inhibition" },
          { name:"Decline Board Squat — Isometric Hold", sets:5, reps:1, hold:45, freq:"Daily", desc:"Stand on 25–35° decline board. Single leg squat hold at 60°. Isometric. More functional than leg extension for athletes.", cues:"Lean forward (decline helps). Hold the position. No bouncing. Feel the tendon load.", evidence:"Strong — most effective isometric loading for patellar tendinopathy" },
        ]
      },
      {
        phase:"Phase 2 — Isotonic Heavy Slow Resistance (Weeks 4–12)",
        color:"#ffb300",
        exercises:[
          { name:"Decline Single-Leg Squat — HSR Protocol", sets:4, reps:8, hold:0, freq:"3×/wk (NOT daily)", desc:"Heavy Slow Resistance (HSR) protocol. Decline board 25°. Single leg. 3s down, 3s up. Load with vest/barbell. Kongsgaard 2009: HSR = best long-term tendinopathy outcome.", cues:"3 seconds down, 3 seconds up. SLOW is the key. Load heavily enough to limit to 8 reps.", evidence:"Strong — Kongsgaard 2009: HSR > corticosteroid at 6 months" },
          { name:"Leg Press (single leg — slow)", sets:4, reps:8, hold:0, freq:"3×/wk", desc:"Slow leg press. 3s eccentric, 3s concentric. Heavier than traditional. Progresses to sport-specific strength.", cues:"Count 3 seconds each way. Heavy enough that last 2 reps are hard.", evidence:"Strong — HSR protocol for tendinopathy" },
          { name:"Spanish Squat (wall squat — isometric)", sets:4, reps:1, hold:45, freq:"Daily between HSR days", desc:"Band around fixed post + behind back. Squat to 60°. Push knees out against band. Long-duration isometric for pain days / maintenance.", cues:"Knees out against band. Back upright. Feel quad. Hold 45 seconds.", evidence:"Strong — adjunct to HSR on rest days" },
        ]
      },
      {
        phase:"Phase 3 — Energy Storage & Return to Sport (Weeks 12+)",
        color:"#ff4d6d",
        exercises:[
          { name:"Box Jump (double to single leg)", sets:4, reps:6, hold:0, freq:"2×/wk", desc:"Load the tendon with energy storage (plyometric). Start double leg. Progress to single leg box jump. Only introduce after HSR for 8 weeks, pain <2/10.", cues:"Land soft. Absorb. Pause. Don't rush. Pain <2/10 only.", evidence:"Strong — energy storage loading for patellar tendon RTS" },
          { name:"Depth Jump + Squat Jump", sets:3, reps:6, hold:0, freq:"2×/wk", desc:"Drop off box then immediate explosive jump. Maximum reactive strength for tendon. Sport-specific for jumpers/runners.", cues:"Ground contact <0.2 sec. Think: hot coals. Explosive. Only if pain-free.", evidence:"Strong — reactive tendon loading for return to jumping sports" },
        ]
      },
    ],
    treatment:[
      { name:"ESWT — Shockwave", desc:"Radial or focused ESWT × 2000 pulses per session × 3 sessions. Apply to patellar tendon. Pain 5–7/10 during acceptable. Best for chronic tendinopathy >3 months.", evidence:"Strong — Zwerver 2011 RCT, multiple systematic reviews" },
      { name:"Avoid Stretching in Acute Phase", desc:"Stretching compresses the tendon against patella. AVOID in phase 1. Only introduce gentle stretching in phase 3 when pain settled.", evidence:"Strong — Purdam 2004: stretching worsens reactive tendinopathy" },
      { name:"Load Monitoring (VISA-P)", desc:"Use VISA-P questionnaire weekly. Score <80 = modify training. Score >90 = safe to progress. Track load with training diary.", evidence:"Strong — VISA-P validated outcome measure for patellar tendinopathy" },
    ]
  },
];

// ── SHOULDER_PROTOCOLS ──
const SHOULDER_PROTOCOLS = [
  {
    id:"shoulder_rct", label:"Rotator Cuff Tendinopathy", icon:"💪", color:"#7f5af0",
    evidence:"Beaudreuil 2011 / Littlewood 2015 / BJSM Guidelines",
    phases:[
      { phase:"Phase 1 — Pain Control & Motor Control (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Pendulum (Codman) Exercise", sets:3, reps:20, hold:0, freq:"3×/day", desc:"Lean forward supported on a table. Let arm hang freely. Gently swing in small circles. Gravity-assisted distraction reduces subacromial compression.", cues:"Relax the shoulder completely. Let gravity do the work. No active muscle effort.", evidence:"Strong — reduces acute subacromial pain, safe in all irritability levels" },
        { name:"Scapular Retraction & Depression", sets:3, reps:15, hold:5, freq:"Daily", desc:"Squeeze shoulder blades together and DOWN. Hold 5s. Restores scapular upward rotation — essential for all RCT rehab.", cues:"Think: put your shoulder blades in your back pockets. Down AND back.", evidence:"Strong — scapular dyskinesis primary driver of subacromial impingement" },
        { name:"Isometric External Rotation (neutral)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Stand side-on to wall. Elbow at 90°, pressed against side. Push hand gently outward into wall. Isometric — no movement. Immediate analgesic effect.", cues:"Maximum effort push — no movement. 45 seconds. Pain 0–4/10 acceptable.", evidence:"Strong — Rio 2015 isometric protocol adapted for shoulder RCT" },
        { name:"Isometric Shoulder Abduction", sets:5, reps:1, hold:30, freq:"Daily", desc:"Stand beside wall. Press back of hand into wall at side. Gentle isometric abduction. Loads supraspinatus without arc of pain impingement zone.", cues:"Gentle push outward. No shrug. Keep shoulder blade down.", evidence:"Strong — supraspinatus isometric loading in phase 1" },
      ]},
      { phase:"Phase 2 — Strength & Load Tolerance (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Side-Lying External Rotation", sets:3, reps:15, hold:2, freq:"Daily", desc:"Lie on non-affected side. Elbow at 90°, forearm resting on abdomen. Rotate forearm up toward ceiling. Best isolation exercise for infraspinatus + teres minor.", cues:"Elbow stays glued to side. Rotate slowly. No shrug. 2s hold at top.", evidence:"Strong — Reinold 2004: highest infraspinatus EMG activation" },
        { name:"Prone Y — Lower Trapezius", sets:3, reps:15, hold:3, freq:"Daily", desc:"Lie face down, arm at 135° (Y position). Raise arm toward ceiling. Thumb up. Lower trapezius activation essential for scapular upward rotation.", cues:"Thumb pointing up. Squeeze scapula down before lifting. Don't shrug.", evidence:"Strong — lower trap isolation for scapular control" },
        { name:"Prone T — Middle Trapezius", sets:3, reps:15, hold:3, freq:"Daily", desc:"Lie face down, arms at 90° (T position). Raise both arms. Middle trap + rhomboid activation. Corrects scapular protraction pattern.", cues:"Arms at 90° exactly. Lift only as high as pain-free. Hold 3s.", evidence:"Strong — Ekstrom 2003: optimal mid-trap activation" },
        { name:"Band External Rotation (0° abduction)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band anchored at elbow height. Elbow at side, 90° flexion. Rotate outward against band. Concentric + eccentric control.", cues:"Elbow stays at side. Slow return (3 seconds in). Keep shoulder blade down.", evidence:"Strong — infraspinatus + teres minor progressive loading" },
        { name:"Full Can (Scaption) — Band/Weight", sets:3, reps:15, hold:1, freq:"Daily", desc:"Arm raised in plane of scapula (30° forward of coronal plane), thumb up. Raise to shoulder height only. Supraspinatus loading in safest arc.", cues:"Thumb up. 30° forward of side. Raise to 90° only. No shrug.", evidence:"Strong — Kelly 1996: full can = optimal supraspinatus with least impingement" },
        { name:"Serratus Anterior Punch", sets:3, reps:15, hold:2, freq:"Daily", desc:"Back on floor or standing at wall. Push arm forward (punch) against resistance. Protracts scapula. Most neglected muscle in shoulder rehab.", cues:"Push forward and slightly upward. Feel the shoulder blade wrapping around ribs.", evidence:"Strong — Ludewig 2004: serratus anterior most important scapular stabiliser" },
      ]},
      { phase:"Phase 3 — Function & Return to Activity (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Overhead Press (cable/dumbbell — pain-free arc)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Progressive overhead loading. Start with cable. Press to full overhead if pain-free. Key functional goal for shoulder rehab.", cues:"Retract scapula first. Press in line with ear. No shrug at top.", evidence:"Strong — progressive overload for RCT return to function" },
        { name:"Pull-Apart — Band (horizontal abduction)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Hold band at shoulder height, hands wide. Pull band apart to T position. Posterior capsule stretch + posterior RCT strengthening.", cues:"Straight elbows. Pull back to T. Squeeze scapulas. Hold 2s.", evidence:"Strong — posterior cuff + scapular retractor loading" },
        { name:"Diagonal PNF Pattern (D2 Flexion)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"With band/cable. Start: arm across body low. Move diagonally up and out to end range. Functional pattern used in throwing, reaching overhead.", cues:"Full diagonal. Thumb leads upward. Smooth arc. No pain >3/10.", evidence:"Strong — PNF D2 pattern: functional overhead rehabilitation" },
        { name:"Wall Slide with Upward Rotation", sets:3, reps:15, hold:2, freq:"Daily", desc:"Forearms on wall, elbows at 90°. Slide arms up while maintaining scapular upward rotation. Challenges serratus + lower trap at end-range overhead.", cues:"Maintain forearm contact. Feel shoulder blade rotate — not just shrug.", evidence:"Strong — overhead scapular control for return to sport/work" },
      ]},
    ],
    treatment:[
      { name:"Posterior Capsule Stretch (Sleeper Stretch)", desc:"Sidelying on affected side. Bring forearm down toward floor (internal rotation). 3 × 30 sec. Tight posterior capsule causes anterosuperior humeral head migration.", evidence:"Strong — Tyler 2010: posterior capsule tightness corrected reduces impingement" },
      { name:"ESWT — Shockwave (calcific tendinopathy)", desc:"Focused ESWT × 2000 pulses × 3 sessions for calcific deposits. Best evidence for calcific rotator cuff tendinopathy.", evidence:"Strong — Gerdesmeyer 2003: ESWT superior to placebo for calcific RCT" },
      { name:"Dry Needling / Acupuncture (trigger points)", desc:"Target infraspinatus, supraspinatus, upper trapezius trigger points. 3–5 needles × 20 min. Reduces myofascial pain and improves ER ROM before exercise.", evidence:"Moderate — trigger point needling reduces shoulder pain in RCT" },
      { name:"Joint Mobilisation — GH Posterior Glide", desc:"Maitland Grade III–IV posterior glide of humeral head. Increases internal rotation range. Indicated when posterior capsular tightness limits IR.", evidence:"Moderate — Bergman 2004: mobilisation + exercise superior to exercise alone" },
      { name:"Kinesio Taping — Scapular Facilitation", desc:"Y-strip from thoracic spine to inferior angle of scapula. Facilitates lower trapezius, corrects scapular downward rotation pattern.", evidence:"Moderate — reduces pain and improves scapular kinematics short-term" },
    ]
  },
  {
    id:"shoulder_instability", label:"Shoulder Instability (MDI/Anterior)", icon:"🔄", color:"#00c97a",
    evidence:"Jaggi & Lambert 2010 / Kuhn 2010 RCT / JOSPT Guidelines",
    phases:[
      { phase:"Phase 1 — Neuromuscular Control (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Rhythmic Stabilisation (Proprioception)", sets:3, reps:20, hold:0, freq:"Daily", desc:"Therapist applies quick random perturbations to arm. Patient resists without allowing movement. Retrains proprioception lost after instability/dislocation.", cues:"React quickly to perturbations. Small muscles — not big prime movers.", evidence:"Strong — proprioceptive retraining primary in instability rehab" },
        { name:"Closed Chain Wall Press (Isometric ER)", sets:3, reps:15, hold:5, freq:"Daily", desc:"Elbow at 90°, forearm against wall. Press outward isometrically. Closed chain — compresses glenohumeral joint. Safe stabiliser activation.", cues:"Press into wall. Feel deep rotators working. No shrug. Hold 5s.", evidence:"Strong — closed chain exercises safer than open chain in instability phase 1" },
        { name:"Four-Point Kneeling Weight Shift", sets:3, reps:20, hold:0, freq:"Daily", desc:"On all fours. Gently shift weight onto affected arm. Small circles. Closed chain proprioception and compression. Fundamental exercise for MDI.", cues:"Elbow soft (not locked). Shift weight slowly. Shoulder blade stable — no winging.", evidence:"Strong — foundational closed chain for MDI and anterior instability" },
        { name:"Scapular Clock Exercise", sets:3, reps:12, hold:2, freq:"Daily", desc:"Move scapula to 12, 3, 6, 9 o'clock positions actively. Improves voluntary scapular control — prerequisite for all shoulder stability.", cues:"Learn to isolate scapular movement from arm movement. Slow and deliberate.", evidence:"Strong — volitional scapular control essential for instability management" },
      ]},
      { phase:"Phase 2 — Dynamic Stability & Strength (Weeks 6–14)", color:"#ffb300", exercises:[
        { name:"External Rotation Strengthening (band — progressive)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band ER in neutral, then 45°, then 90° abduction. Infraspinatus + teres minor depresses humeral head, preventing anterior translation.", cues:"Elbow at side. Rotate outward slowly. Control return 3 seconds. No pain.", evidence:"Strong — Kuhn 2010 RCT: ER strengthening reduces instability events" },
        { name:"Push-Up Plus (Serratus Activation)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Standard push-up then add extra scapular protraction at top. Maximises serratus anterior. Critical for scapular stability in instability.", cues:"At top of push-up: push further — shoulder blades apart. Hold 2s.", evidence:"Strong — highest serratus anterior EMG activation in literature" },
        { name:"Sidelying ER in 90° Abduction", sets:3, reps:15, hold:2, freq:"Daily", desc:"Sidelying, arm abducted to 90° supported. Externally rotate against gravity/weight. Loads infraspinatus in functional position.", cues:"Keep arm at 90° throughout. Rotate slowly. Feel posterior cuff contracting.", evidence:"Strong — posterior cuff functional loading for overhead instability" },
      ]},
      { phase:"Phase 3 — Sport/Function Specific (Weeks 14+)", color:"#ff4d6d", exercises:[
        { name:"Plyometric Ball Catch (wall throw)", sets:3, reps:15, hold:0, freq:"3×/wk", desc:"Throw small ball against wall and catch. Reactive shoulder muscle activation. Trains rapid co-contraction needed for sport.", cues:"Catch with elbow slightly bent. Absorb — don't let arm fly back. Fast reactive catch.", evidence:"Strong — plyometric shoulder loading for return to overhead sport" },
        { name:"90/90 ER Strengthening (throwing position)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Arm abducted 90°, elbow at 90°. ER against band. The 90/90 position is where anterior instability is most at risk — must train here before return to throwing.", cues:"Shoulder at 90°, elbow at 90°. Rotate slowly. No pain. Build trust in position.", evidence:"Strong — position-specific strengthening for anterior instability clearance" },
      ]},
    ],
    treatment:[
      { name:"Taping — Anterior Support (McConnell)", desc:"McConnell tape from posterior deltoid to anterior, unloading anterior capsule. Apply before exercise. Reduces feeling of instability.", evidence:"Moderate — reduces apprehension and allows earlier loading" },
      { name:"Biofeedback EMG Training", desc:"Surface EMG on lower trapezius and serratus anterior. Real-time feedback during exercises. Accelerates motor learning for scapular stabilisers.", evidence:"Moderate — EMG biofeedback improves motor relearning for instability" },
      { name:"Surgical Referral Criteria", desc:"Refer if: >2 dislocation events, failed 6-month conservative management, high-demand athlete, significant labral tear on MRI.", evidence:"Strong — surgery superior to conservative for recurrent traumatic anterior instability in young athletes" },
    ]
  },
  {
    id:"shoulder_frozen", label:"Frozen Shoulder (Adhesive Capsulitis)", icon:"🧊", color:"#38bdf8",
    evidence:"Hannafin & Chiaia 2000 / Favejee 2011 RCT / Cochrane 2014",
    phases:[
      { phase:"Phase 1 — Freezing (Pain-Dominant, Weeks 1–9)", color:"#00c97a", exercises:[
        { name:"Pendulum Exercise", sets:3, reps:20, hold:0, freq:"3×/day", desc:"Lean forward, arm hanging free. Small gravity-assisted circles. Only exercise tolerated in acute freezing phase. Joint distraction reduces pain without stretching inflamed capsule.", cues:"Completely relax the arm. Gentle swing only — no forcing. Use body sway, not shoulder muscle.", evidence:"Strong — only safe active exercise in acute freezing phase" },
        { name:"Heat + Active-Assisted Flexion (supine)", sets:3, reps:10, hold:5, freq:"Daily", desc:"After heat. Lie on back. Use good arm to assist affected arm into flexion. Gravity-eliminated position reduces load.", cues:"Assisted only — good arm does the work. Stop at first resistance. Hold gently 5s.", evidence:"Moderate — maintain ROM without provoking acute capsulitis" },
      ]},
      { phase:"Phase 2 — Frozen (Stiffness-Dominant, Weeks 9–26)", color:"#ffb300", exercises:[
        { name:"Capsular Stretching — ER (hand on door frame)", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Stand in doorway. Elbow at 90°, forearm on frame. Rotate body away from arm. Anterior capsule is tightest — primary stretch in phase 2.", cues:"Body turns away from arm. Feel anterior shoulder stretch. Hold 30s. Pain 4–5/10 acceptable.", evidence:"Strong — Favejee 2011: stretching = corticosteroid injection at 6 weeks" },
        { name:"Finger Walking (flexion and abduction)", sets:3, reps:10, hold:5, freq:"3×/day", desc:"Walk fingers up wall in flexion, then abduction. Mark progress. Gravity-assisted stretch at end of available range.", cues:"Walk to maximum height. Hold at top 5s. Mark your progress on wall with tape.", evidence:"Strong — standard frozen shoulder active ROM exercise" },
        { name:"Pulley-Assisted Flexion", sets:3, reps:15, hold:5, freq:"Daily", desc:"Overhead pulley. Good arm pulls affected arm into flexion. Progressive end-range loading. Maintains and slowly increases capsular length.", cues:"Pull to end range. Hold 5s. Lower slowly. No sharp pain.", evidence:"Strong — active-assisted ROM in frozen phase" },
        { name:"Towel IR Stretch", sets:3, reps:1, hold:30, freq:"Daily", desc:"Hold towel behind back. Good arm above, affected arm below. Good arm gently pulls towel upward — stretches internal rotation.", cues:"Affected arm below. Good arm pulls slowly upward. Stop at firm resistance. 30s hold.", evidence:"Moderate — IR restoration in frozen phase" },
      ]},
      { phase:"Phase 3 — Thawing (Recovery, Months 6–24)", color:"#ff4d6d", exercises:[
        { name:"Full ROM Strengthening — All planes", sets:3, reps:15, hold:0, freq:"3×/wk", desc:"As ROM returns, progressively strengthen through full available range. Include: flexion, abduction, ER/IR, scaption.", cues:"Work through as much range as available. Don't force. ROM is returning — strengthen what you have.", evidence:"Strong — progressive loading as capsule thaws naturally" },
        { name:"Overhead Press (progressive)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Begin dumbbell press in available range. Progress toward full overhead. Final functional milestone in frozen shoulder recovery.", cues:"Start with arm below 90°. Progress overhead as range permits. No cheating with trunk lean.", evidence:"Strong — return to overhead function as primary goal in thawing phase" },
      ]},
    ],
    treatment:[
      { name:"Corticosteroid Injection (early freezing)", desc:"Intra-articular injection in freezing phase (first 3 months). Most effective early intervention. Reduces acute capsular inflammation. Max 2 injections.", evidence:"Strong — Buchbinder 2003 Cochrane: injection superior for short-term pain and ROM" },
      { name:"Hydrodilatation (distension arthrography)", desc:"Inject saline + corticosteroid + local anaesthetic into joint to distend capsule. Effective in frozen phase for rapid ROM gains.", evidence:"Strong — Quraishi 2007: hydrodilatation + physio superior to physio alone" },
      { name:"Heat (pre-exercise)", desc:"Hot pack or heat rub to shoulder 15 min before stretching exercises. Increases capsular extensibility. Always precede stretching with heat.", evidence:"Strong — tissue extensibility increased with heat before stretching" },
      { name:"MUA / Surgical Capsular Release", desc:"Manipulation under anaesthesia or arthroscopic capsular release if no improvement at 6 months.", evidence:"Moderate — indicated in refractory frozen shoulder failing 6-month conservative care" },
    ]
  },
];

// ── ELBOW_PROTOCOLS ──
const ELBOW_PROTOCOLS = [
  {
    id:"elbow_lateral", label:"Lateral Epicondylalgia (Tennis Elbow)", icon:"🎾", color:"#ff4d6d",
    evidence:"Coombes 2015 Lancet / Vicenzino 2003 / BJSM Consensus 2019",
    phases:[
      { phase:"Phase 1 — Pain Control & Isometrics (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Wrist Extension Isometric (pain-free position)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Seated, forearm supported on table, palm down. Press back of hand upward into other hand's resistance. No movement. 45s hold. Immediate pain relief.", cues:"Maximum effort push — no movement. 45 seconds. Pain 0–4/10 acceptable. Do before work tasks.", evidence:"Strong — Rio 2015 isometric protocol: immediate pain relief in tendinopathy" },
        { name:"Wrist Extensor Stretch (gentle)", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Arm straight, palm down. Use other hand to bend wrist downward. Gentle sustained stretch to lateral epicondyle origin.", cues:"Straight elbow. Gentle bend. Feel pull at outer elbow. No sharp pain. 30s hold.", evidence:"Moderate — tissue extensibility maintenance in acute phase" },
        { name:"Grip Strengthening — Putty (submaximal)", sets:3, reps:15, hold:3, freq:"Daily", desc:"Squeeze therapy putty or soft ball. Submaximal 50–60% effort only in phase 1.", cues:"Squeeze gently — not maximum. Hold 3s. Pain 0–3/10 only.", evidence:"Moderate — submaximal grip loading for early lateral epicondylalgia" },
      ]},
      { phase:"Phase 2 — Heavy Slow Resistance (Weeks 4–12)", color:"#ffb300", exercises:[
        { name:"Tyler Twist — Eccentric Wrist Extension", sets:3, reps:15, hold:0, freq:"Daily", desc:"Hold FlexBar with both hands. Twist with good arm into full wrist extension. Bad arm eccentrically controls return. Best evidence exercise for tennis elbow.", cues:"Good arm twists. Bad arm controls return SLOWLY (4s). Use green FlexBar to start.", evidence:"Strong — Tyler 2010 RCT: 81% improvement vs 0% control. Gold standard exercise." },
        { name:"Wrist Extension — Dumbbell (HSR protocol)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Forearm on table, palm down, holding dumbbell. Extend wrist upward (3s up, 3s down). Heavy slow resistance.", cues:"3 seconds up. Hold 2s at top. 3 seconds down. Heavy enough to limit to 15 reps.", evidence:"Strong — HSR superior to eccentric alone for tendinopathy at 6 months" },
        { name:"Forearm Pronation/Supination — Dumbbell", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Elbow at 90°, hold dumbbell at one end (lever). Rotate forearm palm up to palm down.", cues:"Elbow fixed at side. Rotate slowly. The longer you hold the dumbbell end, the harder it is.", evidence:"Moderate — supinator loading reduces lateral elbow load" },
        { name:"Wrist Radial Deviation — Dumbbell", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Hold dumbbell at one end vertically. Raise thumb-side upward (radial deviation). ECRL and ECRB loading.", cues:"Wrist moves only — not elbow. Slow up and slow down.", evidence:"Moderate — full wrist extensor loading for lateral epicondylalgia" },
      ]},
      { phase:"Phase 3 — Function & Return to Sport/Work (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Grip Strengthening — Maximum (dynamometer)", sets:3, reps:10, hold:5, freq:"3×/wk", desc:"Maximum grip strength training. Return to full grip capacity. Key for return to racquet sports, manual work.", cues:"Maximum grip. Hold 5s. Track progress with dynamometer. Goal: equal to unaffected side.", evidence:"Strong — grip strength symmetry = return to sport readiness" },
        { name:"Sport-Specific Loading (racquet/tool simulation)", sets:3, reps:20, hold:0, freq:"3×/wk", desc:"Simulate sport or work movement under load. Gradual return to aggravating activity.", cues:"Start at 50% intensity. Add 10% per week. Pain <2/10 throughout.", evidence:"Strong — sport/work-specific loading for final stage return to function" },
      ]},
    ],
    treatment:[
      { name:"Deep Friction Massage (Cyriax)", desc:"Cross-friction massage directly to ECRB origin at lateral epicondyle. 5–10 min per session 3×/wk. Firm pressure perpendicular to tendon fibres.", evidence:"Moderate — Cyriax friction massage: short-term pain relief and tissue remodelling" },
      { name:"Lateral Elbow MWM (Mulligan)", desc:"Lateral glide of elbow while patient performs pain-free gripping. Immediate pain reduction. 3 sets × 10 reps per session.", evidence:"Strong — Vicenzino 2001: MWM immediate pain-free grip improvement" },
      { name:"ESWT — Shockwave Therapy", desc:"Radial ESWT × 2000 pulses × 3 sessions. Best for chronic lateral epicondylalgia >3 months.", evidence:"Strong — Rompe 2007 RCT: ESWT superior to corticosteroid at 12 months" },
      { name:"Corticosteroid Injection (short-term only)", desc:"Short-term pain relief at 6 weeks. WARNING: superior to physio at 6 weeks but inferior at 12 months and 2 years.", evidence:"Strong — Coombes 2010 Lancet: injection worst long-term outcome. Use only for acute severe pain." },
      { name:"Counterforce Brace", desc:"Apply 2–3 finger widths below lateral epicondyle. Reduces muscle belly expansion during contraction — offloads tendon origin.", evidence:"Moderate — reduces pain during activity; does not treat underlying pathology" },
    ]
  },
  {
    id:"elbow_medial", label:"Medial Epicondylalgia (Golfer's Elbow)", icon:"⛳", color:"#00c97a",
    evidence:"Sims 2014 / Steunebrink 2010 / JOSPT Clinical Practice Guidelines",
    phases:[
      { phase:"Phase 1 — Load Reduction & Isometrics (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Wrist Flexion Isometric (neutral position)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Forearm on table, palm up. Press palm upward into resisting hand. No movement. 45s isometric hold.", cues:"Maximum push — no movement. 45 seconds. Pain 0–4/10. Do before activity.", evidence:"Strong — isometric loading protocol for medial epicondyle tendon pain relief" },
        { name:"Wrist Flexor Stretch", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Arm straight, palm up. Other hand bends wrist into extension. Stretch to medial epicondyle origin.", cues:"Straight elbow. Gentle bend backward. Feel inner elbow stretch. 30s. No sharp pain.", evidence:"Moderate — tissue extensibility for common flexor origin" },
        { name:"Finger Flexor Tendon Gliding", sets:3, reps:10, hold:3, freq:"3×/day", desc:"Move fingers through full tendon glide sequence. Reduces adhesions, maintains tendon mobility in flexor mechanism.", cues:"Slow and deliberate through each position. Hold each 3s. No pain.", evidence:"Moderate — tendon gliding maintains flexor mechanism mobility" },
      ]},
      { phase:"Phase 2 — Progressive Loading (Weeks 4–12)", color:"#ffb300", exercises:[
        { name:"Wrist Flexion — Dumbbell (HSR)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Forearm on table palm up. Curl wrist upward with dumbbell. 3s up, hold 2s, 3s down. Heavy slow resistance for flexor-pronator mass.", cues:"3 seconds up. 3 seconds down. Heavy enough to limit to 15 reps. Forearm supported throughout.", evidence:"Strong — HSR protocol adapted for medial epicondyle tendinopathy" },
        { name:"Forearm Pronation — Dumbbell (lever)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Elbow at 90°, hold dumbbell at one end. Rotate from supination to pronation. Loads pronator teres.", cues:"Elbow fixed. Rotate slowly to palm-down position. 3s each way.", evidence:"Strong — pronator teres loading essential for medial epicondylalgia" },
        { name:"Grip Strengthening — Putty (progressive)", sets:3, reps:20, hold:5, freq:"Daily", desc:"Putty or ball squeeze. Progress from soft to firm putty. Wrist flexors strongly activate with grip.", cues:"Full grip — all fingers. Hold 5s at full compression. 20 reps. Progress putty firmness.", evidence:"Moderate — grip loading as proxy for flexor-pronator mass strengthening" },
      ]},
      { phase:"Phase 3 — Return to Sport/Activity (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Rotational Power Training (medicine ball)", sets:3, reps:12, hold:0, freq:"3×/wk", desc:"Rotational throw against wall with medicine ball. Loads medial elbow in valgus + flexion pattern.", cues:"Start light (1kg). Rotate through core and elbow. Pain <2/10. Build speed gradually.", evidence:"Strong — sport-specific rotational loading for return to throwing/golf" },
        { name:"Wrist Flexion — Max Load", sets:4, reps:8, hold:2, freq:"3×/wk", desc:"Maximum load wrist flexion dumbbell curls. 4 × 8 for maximum strength.", cues:"3s up, 3s down. Load heavy. Track with progressive weight.", evidence:"Strong — maximum strength goal for discharge readiness" },
      ]},
    ],
    treatment:[
      { name:"Deep Friction Massage — Common Flexor Origin", desc:"Transverse friction massage to medial epicondyle origin. 5 min per session. Elbow slightly flexed during treatment.", evidence:"Moderate — tissue remodelling at common flexor tendon origin" },
      { name:"Medial Elbow MWM (Mulligan)", desc:"Lateral glide of elbow joint while patient performs grip or wrist flexion. Immediate pain-free movement restoration.", evidence:"Moderate — MWM immediate pain relief for medial epicondylalgia" },
      { name:"Ulnar Nerve Neural Mobilisation", desc:"Medial epicondylalgia often co-exists with cubital tunnel syndrome. Ulnar nerve sliders: elbow extension + wrist extension in sequence.", evidence:"Moderate — ulnar nerve involvement in up to 60% of medial epicondylalgia cases" },
    ]
  },
  {
    id:"elbow_cubital", label:"Cubital Tunnel Syndrome (Ulnar Nerve)", icon:"⚡", color:"#ffb300",
    evidence:"Caliandro 2016 Cochrane / Svernlöv 2009 RCT / AAOS Guidelines",
    phases:[
      { phase:"Phase 1 — Nerve Protection & Neural Mobility (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Ulnar Nerve Slider (Neural Mobilisation)", sets:3, reps:10, hold:0, freq:"Daily", desc:"Sequence: elbow straight + wrist flexed → elbow bends while wrist extends. Slides ulnar nerve through cubital tunnel without tensioning.", cues:"Smooth alternating movement. No pins and needles during. Stop if symptoms worsen.", evidence:"Strong — neural sliders reduce cubital tunnel symptoms without provoking nerve" },
        { name:"Elbow Flexion Avoidance Training", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"Avoid prolonged elbow flexion beyond 90°. Sleeping: pillow under arm. Phone: use speakerphone. Activity modification is primary intervention.", cues:"Avoid elbow bend beyond 90° for sustained periods. Most important intervention in mild-moderate cubital tunnel.", evidence:"Strong — Svernlöv 2009: night splinting + activity modification = 90% improvement at 6 months" },
        { name:"Grip & Pinch Strength Exercises", sets:3, reps:15, hold:3, freq:"Daily", desc:"Putty squeeze + pinch grip. Maintains intrinsic and extrinsic hand strength. Monitor for ring and little finger weakness.", cues:"Monitor for ring and little finger weakness. If grip declining — escalate to surgeon.", evidence:"Moderate — functional hand strength maintenance in cubital tunnel" },
      ]},
      { phase:"Phase 2 — Strengthening & Function (Weeks 6–12)", color:"#ffb300", exercises:[
        { name:"Ulnar Nerve Tensioner (mild — phase 2 only)", sets:3, reps:10, hold:5, freq:"3×/wk", desc:"Elbow extended, wrist extended, shoulder abducted + depressed. Slight tension on ulnar nerve. Only introduce when slider no longer provokes symptoms.", cues:"Only when sliders are completely symptom-free. Mild tension — stop at first symptom.", evidence:"Moderate — neural tensioning for nerve load tolerance in phase 2" },
        { name:"Intrinsic Hand Strengthening", sets:3, reps:15, hold:2, freq:"Daily", desc:"Finger abduction/adduction against resistance band. Interossei + hypothenar strengthening.", cues:"Spread fingers apart against band. Hold 2s. Monitor for weakness progression.", evidence:"Moderate — intrinsic strengthening for ulnar nerve motor preservation" },
      ]},
      { phase:"Phase 3 — Return to Full Function (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Progressive Grip Load — Dynamometer", sets:3, reps:10, hold:5, freq:"3×/wk", desc:"Measure grip strength with dynamometer. Progress to match unaffected side. Primary outcome measure.", cues:"Track progress. Goal: symmetrical grip strength. 10% per week increase maximum.", evidence:"Strong — grip strength symmetry primary outcome measure for cubital tunnel recovery" },
      ]},
    ],
    treatment:[
      { name:"Night Splint — Elbow Extension (30°)", desc:"Splint keeping elbow at 30° flexion during sleep. Most effective single intervention for mild-moderate cubital tunnel.", evidence:"Strong — Svernlöv 2009: night splinting = primary conservative treatment, 90% success mild-moderate" },
      { name:"Elbow Padding (soft pad)", desc:"Foam elbow pad over medial epicondyle during activities. Protects ulnar nerve from direct compression.", evidence:"Moderate — reduces direct pressure on cubital tunnel during daily activities" },
      { name:"Ergonomic Assessment", desc:"Assess workstation: keyboard height, armrest position, phone use. Sustained elbow flexion >90° is primary provocateur.", evidence:"Strong — ergonomic modification reduces sustained nerve compression" },
      { name:"Surgical Referral Criteria", desc:"Refer if: intrinsic muscle wasting, grip strength <60% unaffected side, failed 6-month conservative management. Anterior transposition or in-situ decompression.", evidence:"Strong — surgery for moderate-severe cubital tunnel with motor deficit" },
    ]
  },
  {
    id:"elbow_olecranon", label:"Olecranon Bursitis", icon:"🫧", color:"#38bdf8",
    evidence:"Reilly 1987 / Blackwell 2014 / BMJ Clinical Evidence Review",
    phases:[
      { phase:"Phase 1 — Swelling Control (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Elbow Protection & Padding", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"Apply elbow pad over olecranon 24/7. Prevents repeated trauma to bursa. Most important intervention.", cues:"Never rest elbow directly on hard surface. Pad during sleep. Primary treatment in traumatic bursitis.", evidence:"Strong — pressure elimination is primary treatment for traumatic olecranon bursitis" },
        { name:"Ice + Compression (20 min, 3×/day)", sets:3, reps:1, hold:0, freq:"3×/day", desc:"Ice pack over elbow with compression bandage. 20 min on, 40 min off. Reduces bursal swelling and inflammation.", cues:"Never ice directly on skin. Compression bandage after icing. Elevate arm above heart.", evidence:"Strong — RICE protocol for acute bursitis swelling reduction" },
        { name:"Gentle Elbow ROM (pain-free arc only)", sets:3, reps:10, hold:0, freq:"Daily", desc:"Active elbow flexion/extension through pain-free range only. Maintains joint mobility while bursa settles.", cues:"Move only in pain-free range. Do not force. No direct pressure on back of elbow.", evidence:"Moderate — ROM maintenance during acute bursitis without aggravating bursa" },
      ]},
      { phase:"Phase 2 — Strength Recovery (Weeks 4–8)", color:"#ffb300", exercises:[
        { name:"Tricep Strengthening — Band (kickback)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Band fixed, elbow at 90°. Extend elbow against resistance. Strengthens tricep without compressing olecranon bursa.", cues:"Elbow control — slow extension. Avoid pressure on back of elbow. Monitor for swelling increase.", evidence:"Moderate — tricep strengthening without direct bursal compression" },
        { name:"Elbow Full ROM — Active", sets:3, reps:15, hold:0, freq:"Daily", desc:"Full active elbow flexion/extension as swelling allows. Progress to full range.", cues:"Full range when comfortable. Monitor swelling after exercise.", evidence:"Moderate — full ROM restoration in resolving bursitis" },
      ]},
      { phase:"Phase 3 — Return to Activity (Weeks 8+)", color:"#ff4d6d", exercises:[
        { name:"Full Elbow Strengthening Programme", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Bicep curl, tricep extension, forearm pronation/supination with progressive dumbbell load.", cues:"Pad during sport/manual work permanently if contact risk. Track progress.", evidence:"Strong — full strength restoration before return to contact sport/manual work" },
      ]},
    ],
    treatment:[
      { name:"Aspiration (needle drainage)", desc:"Ultrasound-guided aspiration of bursal fluid if tense or very swollen. Combined with corticosteroid injection in non-septic bursitis.", evidence:"Moderate — aspiration provides rapid symptom relief; recurrence rate 30% without corticosteroid" },
      { name:"Corticosteroid Injection (non-septic only)", desc:"Inject after aspiration in confirmed non-septic bursitis. NEVER inject if septic bursitis suspected.", evidence:"Moderate — corticosteroid post-aspiration reduces recurrence in non-septic olecranon bursitis" },
      { name:"Antibiotic Treatment (septic bursitis)", desc:"If septic: flucloxacillin 500mg QDS × 2 weeks. Refer to emergency if systemically unwell.", evidence:"Strong — antibiotic treatment mandatory for septic bursitis" },
    ]
  },
];

// ── HIP_PROTOCOLS ──
const HIP_PROTOCOLS = [
  {
    id:"hip_oa", label:"Hip Osteoarthritis", icon:"🦴", color:"#ff7043",
    evidence:"NICE 2022 / OARSI 2019 / Cochrane Hip OA Review",
    phases:[
      { phase:"Phase 1 — Pain Control & Activation (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Supine Hip Abduction (sidelying)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Sidelying, raise top leg 30°. Hold 2s. Glute med activation without axial hip load. Safe in all hip OA stages.", cues:"Don't roll pelvis back. Toes slightly down. Hold at top.", evidence:"Strong — glute med activation without joint compression in hip OA" },
        { name:"Supine Hip Flexion (heel slide)", sets:3, reps:15, hold:0, freq:"Daily", desc:"Lie on back. Slide heel toward buttocks. Gravity-eliminated ROM exercise. Maintains hip flexion without axial load.", cues:"Slide heel — don't lift leg. Keep foot in contact. Go to comfortable range only.", evidence:"Strong — ROM maintenance without joint compression in acute OA" },
        { name:"Bridging — Bilateral", sets:3, reps:15, hold:5, freq:"Daily", desc:"Lie on back, knees bent, feet flat. Push through heels to lift hips. Hold 5s. Glute max activation without hip compression.", cues:"Push through heels. Squeeze glutes at top. Keep spine neutral.", evidence:"Strong — glute max + hamstring activation in non-weight-bearing position" },
        { name:"Seated Hip Flexor Stretch", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Sit at edge of chair. Let one leg drop behind. Tilt pelvis posteriorly. Stretch hip flexors — tight in hip OA.", cues:"Sit tall. Tilt pelvis back. Feel stretch at front of hip. 30s. No lumbar arch.", evidence:"Strong — hip flexor length restoration reduces anterior hip impingement in OA" },
      ]},
      { phase:"Phase 2 — Strength & Load (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Mini Squat (0–45°) — Wall Support", sets:3, reps:15, hold:2, freq:"Daily", desc:"Stand with back to wall. Squat to 45° only. Functional quad + glute loading within pain-free range.", cues:"Weight even. Knees over 2nd toe. Stop at 45°. Push through heels to return.", evidence:"Strong — OARSI recommended functional loading for hip OA" },
        { name:"Step-Up (10cm step)", sets:3, reps:12, hold:1, freq:"Daily", desc:"Step up with affected leg leading. Full hip and knee extension at top. 3s eccentric lower.", cues:"Push through heel at top. Full extension. Lower the other foot slowly — 3 seconds.", evidence:"Strong — functional glute + quad loading for hip OA" },
        { name:"Resistance Band Hip Abduction (standing)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Band above knees. Stand on one leg. Abduct other leg against band. Reduces Trendelenburg gait pattern.", cues:"Stand tall. Abduct slowly. Hold 2s. Don't lean to side. Keep pelvis level.", evidence:"Strong — glute med WB loading reduces hip OA gait deviation" },
        { name:"Static Cycling", sets:1, reps:0, hold:0, freq:"20–30 min daily", desc:"Low resistance cycling. Seat high to limit hip flexion. Best aerobic exercise for hip OA.", cues:"Seat high enough so hip flexes only 70–80° at bottom of stroke. No pain.", evidence:"Strong — NICE 2022: aerobic exercise first-line for hip OA" },
        { name:"Lateral Band Walk", sets:3, reps:20, hold:0, freq:"Daily", desc:"Band above knees. Side-step in slight squat. Glute med + TFL strengthening in weight-bearing.", cues:"Stay low. Steps sideways. Knees tracking over toes. Band stays taut throughout.", evidence:"Strong — functional glute med loading for hip OA gait retraining" },
      ]},
      { phase:"Phase 3 — Function & Long Term (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Stance (balance + strength)", sets:3, reps:1, hold:30, freq:"Daily", desc:"Stand on affected leg. Hold 30s. Progress: eyes closed, unstable surface. Reduces Trendelenburg and fall risk.", cues:"Stand tall. Slight knee bend. Pelvis level. Focus point ahead.", evidence:"Strong — proprioception training reduces hip OA disability" },
        { name:"Walking Programme — Progressive", sets:1, reps:0, hold:0, freq:"Daily", desc:"Start: 10 min flat. Progress 10% per week. Target: 30 min continuous. Best long-term intervention for hip OA.", cues:"Flat surface initially. Comfortable pace. Slight ache OK. Sharp pain: stop.", evidence:"Strong — NICE 2022 / OARSI: walking primary long-term recommendation for hip OA" },
        { name:"Leg Press — Single Leg (progressive)", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Single-leg press 0–60° range. Progressive load. Best gym exercise for hip OA.", cues:"Push through heel. Don't lock knee. Control return 3 seconds.", evidence:"Strong — progressive overload for hip OA functional recovery" },
      ]},
    ],
    treatment:[
      { name:"Manual Therapy — Hip Joint Mobilisation", desc:"Maitland Grade III–IV long-axis distraction + posterior glide. Reduces pain, improves IR and flexion ROM.", evidence:"Strong — Hoeksma 2004 RCT: manual therapy superior to exercise alone for hip OA at 5 weeks" },
      { name:"Corticosteroid Injection (intra-articular)", desc:"Ultrasound-guided IA injection. Consider if pain >7/10 preventing exercise. Short-term relief 4–8 weeks. Max 3 per year.", evidence:"Moderate — short-term pain relief allows physiotherapy; not disease-modifying" },
      { name:"Walking Aids Assessment", desc:"Assess need for walking stick (contralateral hand). Reduces hip joint load 25%. Prescribe if Trendelenburg gait.", evidence:"Strong — contralateral walking stick reduces hip joint load significantly in OA" },
      { name:"Weight Management Advice", desc:"Each 1kg weight loss reduces hip joint load by 3–4kg. Target BMI <25. Refer to dietitian if BMI >30.", evidence:"Strong — weight loss reduces hip OA symptoms and progression" },
    ]
  },
  {
    id:"hip_gtrochanteric", label:"Greater Trochanteric Pain Syndrome", icon:"📍", color:"#7f5af0",
    evidence:"Mellor 2018 JAMA / Vicenzino 2015 / LEAP Trial",
    phases:[
      { phase:"Phase 1 — Load Management & Tendon Protection (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Hip Abductor Isometric (standing — wall)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Stand side-on to wall. Press hip into wall isometrically. 45s hold. Immediate analgesic effect for gluteal tendinopathy.", cues:"Stand tall. Press hip into wall — not pelvis. 45 seconds. Pain 0–4/10 only.", evidence:"Strong — isometric loading: immediate pain relief for gluteal tendinopathy" },
        { name:"Posture Correction — Avoid Hip Adduction", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"CRITICAL: Avoid hip adduction positions — crossing legs, sitting with knees together, standing with weight on one hip.", cues:"No leg crossing. No hip hike standing. Sleep with pillow between knees. Sit with knees apart.", evidence:"Strong — LEAP trial: load management superior to corticosteroid injection at 12 months" },
        { name:"Clam Exercise (glute med isolation)", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying, hips at 30° flexion (not more). Band above knees. Open top knee upward. Glute med isolation without compressive tendon load.", cues:"Hips at 30° only — more flexion compresses tendon. Foot stays grounded. Slow open.", evidence:"Strong — glute med activation without tendon compression in early GTPS" },
        { name:"Bridging — Bilateral (controlled)", sets:3, reps:15, hold:5, freq:"Daily", desc:"Bilateral bridge. Glute max + med activation without compressive hip adduction load.", cues:"Push through both heels. Squeeze glutes. Level pelvis. No hip drop.", evidence:"Strong — bilateral glute loading without compressive tendon forces" },
      ]},
      { phase:"Phase 2 — Progressive Tendon Loading (Weeks 6–12)", color:"#ffb300", exercises:[
        { name:"Single-Leg Bridge (eccentric control)", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Bridge up bilateral. Lower one leg. Hold single-leg bridge 2s. Progressive unilateral glute loading.", cues:"Keep pelvis level during single-leg hold. Don't let hip drop. Build to 12 reps.", evidence:"Strong — progressive unilateral glute loading for gluteal tendinopathy" },
        { name:"Side-Lying Hip Abduction — Weighted", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Sidelying, ankle weight. Abduct top leg to 30°. Hold 2s. Slow lower. Progressive glute med isotonic loading.", cues:"Toes slightly down. 30° abduction only. Hold at top. 3s lower. Don't roll pelvis.", evidence:"Strong — isotonic glute med loading for GTPS" },
        { name:"Standing Hip Abduction — Band (heavy)", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Heavy resistance band. Stand on one leg. Abduct other against band. Functional WB glute med loading.", cues:"Stand tall. Pelvis level. Abduct slowly. Hold 2s. No hip hike or lean.", evidence:"Strong — functional glute med WB loading for GTPS" },
        { name:"Wall Squat — Bilateral (0–60°)", sets:3, reps:15, hold:2, freq:"Daily", desc:"Back to wall. Squat to 60°. Bilateral — avoids hip adduction. Glute + quad functional loading.", cues:"Feet shoulder width. Knees tracking over toes. Keep weight even. No single-leg bias.", evidence:"Moderate — bilateral squat for GTPS functional strength" },
      ]},
      { phase:"Phase 3 — Energy Storage & Function (Weeks 12+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Squat (controlled)", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Single-leg squat to 45°. Knee over 2nd toe. Pelvis level. Primary functional test AND exercise for GTPS.", cues:"Slow 3s down. Hold 2s. Push through heel up. Knee straight over 2nd toe. No valgus.", evidence:"Strong — functional single-leg loading for return to activity in GTPS" },
        { name:"Step-Down Eccentric (lateral)", sets:3, reps:10, hold:0, freq:"3×/wk", desc:"Stand on step. Lower non-affected foot slowly (4s). Eccentric glute control. Most demanding functional exercise.", cues:"Count 4 seconds down. Knee tracks over 2nd toe. Pelvis level throughout.", evidence:"Strong — eccentric glute loading for return to sport/stairs" },
        { name:"Running / Walking Programme — Graded", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return to running. Start: walk-jog intervals. Progress 10% per week.", cues:"No camber running. Flat surface. Increase time before speed.", evidence:"Strong — graded running load for return to sport in GTPS" },
      ]},
    ],
    treatment:[
      { name:"Education — Tendon Load Management", desc:"Avoid: crossing legs, hip adduction stretches, IT band stretches (compresses tendon), deep hip flexion. Education alone reduces symptoms.", evidence:"Strong — LEAP 2018 JAMA: education + exercise superior to corticosteroid at 12 months" },
      { name:"ESWT — Shockwave", desc:"Radial ESWT × 2000 pulses × 3 sessions. Apply to point of maximum tenderness over greater trochanter.", evidence:"Strong — Rompe 2009: ESWT superior to home training and corticosteroid at 15 months" },
      { name:"Corticosteroid Injection (short-term only)", desc:"Superior at 8 weeks — inferior at 12 months vs exercise. Use only for severe acute pain preventing exercise.", evidence:"Strong — Mellor 2018: injection worse than exercise at 12 months. Short-term bridge only." },
      { name:"Avoid IT Band / Piriformis Stretches", desc:"Hip adduction stretches compress the gluteal tendons against the greater trochanter. STRICTLY AVOID in GTPS.", evidence:"Strong — compressive load avoidance is primary principle in GTPS management" },
    ]
  },
  {
    id:"hip_labral", label:"Hip Labral Tear (FAI / Non-Surgical)", icon:"🔵", color:"#38bdf8",
    evidence:"Casartelli 2011 / Freke 2016 / BJSM FAI Consensus 2016",
    phases:[
      { phase:"Phase 1 — Pain Control & Motor Control (Weeks 1–8)", color:"#00c97a", exercises:[
        { name:"Diaphragmatic Breathing + Core", sets:3, reps:10, hold:5, freq:"Daily", desc:"Lie on back, knees bent. Breathe into abdomen. Establishes intra-abdominal pressure and deep core activation. Foundation for hip labral stability.", cues:"Belly rises on inhale. Ribs down. Don't hold breath during exercise.", evidence:"Strong — deep core activation reduces hip joint stress in labral pathology" },
        { name:"Posterior Pelvic Tilt + TrA", sets:3, reps:15, hold:5, freq:"Daily", desc:"Supine, knees bent. Flatten lower back to floor. Hold 5s. Activates TrA and multifidus. Reduces anterior hip impingement position.", cues:"Nod pelvis backward. Feel lower back flatten. Don't hold breath.", evidence:"Strong — posterior pelvic tilt reduces anterior FAI impingement position" },
        { name:"Dead Bug (core + hip dissociation)", sets:3, reps:10, hold:5, freq:"Daily", desc:"Lie on back, arms up, hips at 90°. Lower one heel toward floor while maintaining core brace. Hip dissociation from spine — fundamental for FAI rehab.", cues:"Back stays flat throughout. Lower leg slowly. Breathe out as leg lowers. Stop if back arches.", evidence:"Strong — hip-spine dissociation training for FAI and labral stability" },
      ]},
      { phase:"Phase 2 — Strength & Neuromuscular Control (Weeks 8–16)", color:"#ffb300", exercises:[
        { name:"Glute Med Strengthening — Sidelying", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying hip abduction with ankle weight. Glute med weakness is primary finding in FAI and labral tears.", cues:"Toes slightly down. 30° abduction. Hold 2s. Track progress.", evidence:"Strong — glute med weakness primary modifiable factor in FAI" },
        { name:"Single-Leg Bridge — Progressive", sets:3, reps:12, hold:3, freq:"3×/wk", desc:"Bilateral → single-leg bridge → single-leg with contralateral hip extension. Progressive unilateral glute loading.", cues:"Pelvis level throughout. No hip drop. 3s hold per rep.", evidence:"Strong — unilateral glute loading for labral and FAI hip stability" },
        { name:"Hip Hinge — Deadlift Pattern (bodyweight)", sets:3, reps:15, hold:1, freq:"3×/wk", desc:"Push hips back. Maintain neutral spine. Return through glute squeeze. Fundamental movement retraining for FAI.", cues:"Push bum back to wall behind you. Spine neutral. Drive hips forward to return.", evidence:"Strong — hip hinge retraining reduces anterior hip impingement mechanics" },
        { name:"Lateral Band Walk (monster walk)", sets:3, reps:20, hold:0, freq:"Daily", desc:"Heavy band above knees. Step forward-diagonal pattern. Glute med + max co-activation in functional WB position.", cues:"Slight squat position throughout. Control every step. No knee valgus.", evidence:"Strong — functional glute co-activation for FAI hip stability" },
      ]},
      { phase:"Phase 3 — Return to Sport/Function (Weeks 16+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Squat (full control)", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Single-leg squat to 60°. Full control of hip, knee, and pelvis. Key functional test for return to sport in FAI.", cues:"Knee tracks over 2nd toe. Pelvis level. No impingement pain at depth.", evidence:"Strong — single-leg squat as functional return to sport test for FAI" },
        { name:"Romanian Deadlift — Weighted", sets:3, reps:10, hold:1, freq:"3×/wk", desc:"Hip hinge with dumbbell/barbell. Progressive hamstring + glute max loading. Key strength exercise in FAI return to sport.", cues:"Push hips back. Spine neutral. Drive hips forward. Progressive load.", evidence:"Strong — posterior chain loading for FAI return to running/sport" },
        { name:"Running Mechanics Retraining", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return with focus on hip extension at push-off, reduced anterior pelvic tilt, cadence increase.", cues:"Run tall. Drive hip back at push-off. Increase cadence 5–10%.", evidence:"Strong — running retraining reduces FAI impingement mechanics during sport" },
      ]},
    ],
    treatment:[
      { name:"Activity Modification (avoid impingement)", desc:"Avoid: deep hip flexion, hip IR in flexion, squatting below 90°, sitting low. Modify sport/work to avoid provocative range.", evidence:"Strong — activity modification reduces labral stress in conservative FAI management" },
      { name:"Intra-Articular Injection (diagnostic + therapeutic)", desc:"Ultrasound/fluoroscopy-guided IA injection. If significant pain relief = confirms intra-articular source.", evidence:"Moderate — diagnostic value + short-term pain relief for FAI/labral tears" },
      { name:"Surgical Referral Criteria", desc:"Refer if: failed 3–6 month conservative management, significant bony morphology, unable to return to sport.", evidence:"Strong — surgery for failed conservative FAI management with significant morphological impingement" },
    ]
  },
  {
    id:"hip_piriformis", label:"Piriformis Syndrome / Deep Gluteal", icon:"⚡", color:"#00c97a",
    evidence:"Boyajian-O'Neill 2008 / Hopayian 2010 / JOSPT Clinical Guidelines",
    phases:[
      { phase:"Phase 1 — Neural & Muscle Release (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Piriformis Stretch — Figure 4 (supine)", sets:3, reps:1, hold:30, freq:"3×/day", desc:"Lie on back. Cross affected ankle over opposite knee. Pull both knees toward chest. Deep buttock stretch.", cues:"Keep ankle flexed (dorsiflexed). Pull gently. Feel deep buttock stretch. 30s. No pins and needles.", evidence:"Strong — primary stretch for piriformis shortening and sciatic nerve irritation" },
        { name:"Sciatic Nerve Slider", sets:3, reps:10, hold:0, freq:"Daily", desc:"Seated. Straighten knee + dorsiflex ankle together → relax. Slides sciatic nerve through piriformis.", cues:"Slow smooth movement. No sustained stretch. Stop if pins and needles increase.", evidence:"Strong — neural mobilisation for sciatic nerve sensitisation in piriformis syndrome" },
        { name:"Foam Roll — Gluteal (piriformis region)", sets:2, reps:1, hold:60, freq:"Daily", desc:"Sit on foam roller. Cross one ankle over knee. Roll onto crossed-leg side — directly on deep glute.", cues:"Find the tender spot. Hold there 10–15s. Breathe and relax.", evidence:"Moderate — myofascial release reduces piriformis tone and sciatic irritation" },
      ]},
      { phase:"Phase 2 — Strength & Stability (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Clam Exercise — Glute Med", sets:3, reps:20, hold:2, freq:"Daily", desc:"Sidelying, hips at 60° flexion, band above knees. Open top knee upward. Piriformis overactivates when glute med is weak.", cues:"Hips at 60°. Foot stays grounded. Open slowly. Feel outer glute, not deep.", evidence:"Strong — glute med strengthening reduces piriformis compensatory overactivation" },
        { name:"Glute Max Bridging — Unilateral", sets:3, reps:15, hold:3, freq:"Daily", desc:"Single-leg bridge. Hold 3s at top. Glute max activation reduces piriformis load.", cues:"Drive through heel. Level pelvis. Don't let hip drop. Squeeze glute at top.", evidence:"Strong — glute max reactivation reduces piriformis overuse" },
        { name:"Standing Hip Abduction — Weighted", sets:3, reps:15, hold:2, freq:"3×/wk", desc:"Hold wall for balance. Abduct leg against ankle weight. Glute med strengthening in weight-bearing.", cues:"Stand tall. Don't lean. Abduct 30°. Hold 2s. Level pelvis throughout.", evidence:"Strong — WB glute med loading for piriformis syndrome management" },
      ]},
      { phase:"Phase 3 — Function & Return to Activity (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Single-Leg Squat — Controlled", sets:3, reps:12, hold:2, freq:"3×/wk", desc:"Single-leg squat to 45°. Tests glute med and max function — if piriformis syndrome resolved, should be pain-free.", cues:"Control knee. Level pelvis. No deep buttock pain. Progress depth gradually.", evidence:"Strong — functional return to activity test for piriformis syndrome" },
        { name:"Running Cadence + Hip Extension Training", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return to running with focus on hip extension at push-off and gluteal activation.", cues:"Run tall. Drive hip back. Slight forward lean. Monitor for deep buttock pain.", evidence:"Strong — biomechanical running correction reduces piriformis overload" },
      ]},
    ],
    treatment:[
      { name:"Dry Needling — Piriformis Trigger Points", desc:"Trigger point dry needling to piriformis muscle belly. Patient prone. 3–5 needles × 20 min.", evidence:"Strong — Fishman 2002: dry needling superior to injection and stretching alone" },
      { name:"Neural Mobilisation — Sciatic Nerve", desc:"Sciatic nerve sliders and tensioners. Reduces intraneural oedema from piriformis compression.", evidence:"Strong — neural mobilisation reduces radicular symptoms in piriformis syndrome" },
      { name:"Sitting Posture Modification", desc:"Avoid sitting on wallet/hard objects. Use coccyx cushion. Avoid cross-legged sitting.", evidence:"Strong — postural modification reduces sustained nerve compression in piriformis syndrome" },
    ]
  },
  {
    id:"hip_hamstring", label:"Proximal Hamstring Tendinopathy", icon:"💥", color:"#ff4d6d",
    evidence:"Puranen 1988 / Lempainen 2009 / Goom 2016 IJSPT",
    phases:[
      { phase:"Phase 1 — Load Protection & Isometrics (Weeks 1–6)", color:"#00c97a", exercises:[
        { name:"Isometric Hamstring Contraction (prone)", sets:5, reps:1, hold:45, freq:"Daily", desc:"Lie face down. Bend knee to 90°. Partner resists downward. Maximum isometric contraction 45s. Analgesic effect.", cues:"Maximum effort push — no movement. 45 seconds. Pain 0–4/10 acceptable.", evidence:"Strong — isometric loading for proximal hamstring tendinopathy pain relief" },
        { name:"Sitting Posture Management", sets:1, reps:0, hold:0, freq:"Ongoing", desc:"CRITICAL: Avoid prolonged sitting on hard surfaces. Use cushion. Keep hip flexion <70° when sitting.", cues:"Sit on soft surface. Lean forward slightly. No crossing legs. Stand every 30 min.", evidence:"Strong — compressive load avoidance is primary intervention in proximal hamstring tendinopathy" },
        { name:"Prone Hip Extension (glute activation)", sets:3, reps:15, hold:3, freq:"Daily", desc:"Lie face down. Lift one leg straight. Activates glute max to offload hamstring.", cues:"Squeeze glute first, then lift leg. Knee straight. Hold 3s. Feel glute working, not hamstring.", evidence:"Strong — glute max activation reduces proximal hamstring load" },
      ]},
      { phase:"Phase 2 — Heavy Slow Resistance (Weeks 6–14)", color:"#ffb300", exercises:[
        { name:"Deadlift — Hip Hinge (progressive load)", sets:3, reps:8, hold:1, freq:"3×/wk", desc:"Hip hinge deadlift. Start bodyweight, progress to barbell. 3s down, 3s up. Heavy slow resistance. Best exercise for PHT.", cues:"Push hips back. Spine neutral. Hamstring stretch at bottom. Drive hips forward. SLOW is key.", evidence:"Strong — HSR deadlift primary evidence-based exercise for proximal hamstring tendinopathy" },
        { name:"Nordic Hamstring Curl (eccentric)", sets:3, reps:6, hold:0, freq:"3×/wk", desc:"Kneel, feet fixed. Lower body forward slowly (3–5s). Eccentric hamstring loading.", cues:"Lower as slowly as possible. 5 seconds down. Catch yourself at bottom.", evidence:"Strong — Petersen 2011: Nordic curls reduce hamstring injury and strengthen proximal tendon" },
        { name:"Romanian Deadlift — Single Leg", sets:3, reps:10, hold:1, freq:"3×/wk", desc:"Single-leg RDL with dumbbell. Balance + hamstring + glute loading simultaneously.", cues:"Hip hinge on one leg. Spine neutral. Feel hamstring tension. Control balance.", evidence:"Strong — unilateral loading for PHT sport-specific strength" },
      ]},
      { phase:"Phase 3 — Energy Storage & Return to Sport (Weeks 14+)", color:"#ff4d6d", exercises:[
        { name:"Sprint Mechanics — Graded Return", sets:4, reps:6, hold:0, freq:"2×/wk", desc:"Graded sprint: jog → stride → 75% → 90% → 100%. Monitor PHT pain 24h post-session.", cues:"Build speed over 4 weeks. Track pain 24h post. No sprinting if pain >2/10 next day.", evidence:"Strong — graded sprint exposure for return to running sport with PHT" },
        { name:"Barbell Deadlift — Max Strength", sets:4, reps:5, hold:1, freq:"2×/wk", desc:"Heavy barbell deadlift. 4 × 5 for maximum posterior chain strength. Goal: 1.5× bodyweight.", cues:"Maximum load with perfect form. Track 1RM progress. Goal = 1.5× BW.", evidence:"Strong — maximum strength benchmark for PHT return to sprint sport clearance" },
      ]},
    ],
    treatment:[
      { name:"ESWT — Shockwave (ischial tuberosity)", desc:"Focused ESWT × 2000 pulses directly over ischial tuberosity. 3 sessions × weekly. Best for chronic PHT >3 months.", evidence:"Strong — Cacchio 2011 RCT: ESWT superior to exercise alone for chronic PHT" },
      { name:"Avoid Hamstring Stretching (acute phase)", desc:"Stretching compresses proximal hamstring tendon against ischial tuberosity. STRICTLY AVOID in phases 1–2.", evidence:"Strong — compressive stretching worsens reactive proximal hamstring tendinopathy" },
      { name:"VISA-H Outcome Monitoring", desc:"Use VISA-H questionnaire every 4 weeks. Score <80 = modify training load. Score >90 = cleared for full sport.", evidence:"Strong — VISA-H validated outcome measure for proximal hamstring tendinopathy" },
    ]
  },
  {
    id:"hip_iliopsoas", label:"Iliopsoas Bursitis / Snapping Hip", icon:"🔄", color:"#ffb300",
    evidence:"Mozes 1985 / Deslandes 2008 / JOSPT Hip Guidelines",
    phases:[
      { phase:"Phase 1 — Symptom Control & Flexibility (Weeks 1–4)", color:"#00c97a", exercises:[
        { name:"Iliopsoas Stretch — Kneeling Lunge", sets:3, reps:1, hold:40, freq:"3×/day", desc:"Kneel on affected knee. Step other foot forward. Push hips forward. Posterior pelvic tilt during stretch.", cues:"Tuck pelvis under (posterior tilt). Feel stretch at front of hip. Hold 40s. No arch in back.", evidence:"Strong — iliopsoas lengthening primary intervention for iliopsoas bursitis and snapping hip" },
        { name:"Abdominal Bracing + Posterior Pelvic Tilt", sets:3, reps:15, hold:10, freq:"Daily", desc:"Standing or supine. Brace abdomen. Tilt pelvis posteriorly. Reduces anterior pelvic tilt which shortens iliopsoas.", cues:"Nod pelvis back. Flatten lower back. Hold 10s. Breathe normally.", evidence:"Strong — anterior pelvic tilt correction reduces iliopsoas tension in snapping hip" },
        { name:"Hip Flexor Rolling — Quadriceps/Iliopsoas", sets:2, reps:1, hold:60, freq:"Daily", desc:"Prone on foam roller. Roll from ASIS to mid-thigh. Reduces iliopsoas myofascial tone.", cues:"Find tender area. Hold 10–15s. Breathe and relax. Do NOT roll over bone (ASIS).", evidence:"Moderate — myofascial release reduces iliopsoas tone and snapping hip frequency" },
      ]},
      { phase:"Phase 2 — Strengthening & Movement Retraining (Weeks 4–10)", color:"#ffb300", exercises:[
        { name:"Iliopsoas Eccentric Loading — Step-Up", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Step-up focusing on controlled hip flexion lowering phase. Loads iliopsoas eccentrically.", cues:"Slow lower of trailing leg. 3s. Control the snap position. Stop if snapping worsens.", evidence:"Moderate — eccentric iliopsoas loading for snapping hip retraining" },
        { name:"Core Strengthening — Plank Series", sets:3, reps:1, hold:30, freq:"Daily", desc:"Forearm plank → side plank → plank with hip extension. Reduces anterior pelvic tilt driving iliopsoas tightness.", cues:"Spine neutral. Don't sag hips. Breathe normally. Build from 20s to 60s.", evidence:"Strong — core strength reduces anterior pelvic tilt and iliopsoas load" },
        { name:"Glute Med Strengthening — Clam + Band Walk", sets:3, reps:20, hold:2, freq:"Daily", desc:"Glute med weakness drives anterior pelvic tilt and iliopsoas overload.", cues:"Clam: hips 60°. Band walk: stay low. Pelvis level. Don't lean.", evidence:"Strong — glute med strengthening reduces anterior pelvic tilt driving snapping hip" },
      ]},
      { phase:"Phase 3 — Return to Full Activity (Weeks 10+)", color:"#ff4d6d", exercises:[
        { name:"Full Hip Flexion Strengthening — Resistance", sets:3, reps:12, hold:1, freq:"3×/wk", desc:"Cable or band hip flexion against resistance. Full controlled arc. Tests iliopsoas under load without snapping.", cues:"Controlled lift to 90°. Slow return. No snapping. Progress resistance gradually.", evidence:"Strong — full-range loaded hip flexion for iliopsoas return to function" },
        { name:"Running — Graded Return", sets:1, reps:0, hold:0, freq:"3×/wk", desc:"Graded return to running. Monitor for snapping during running gait.", cues:"No snapping during jog = safe to progress. Pain or snap: reduce pace and distance.", evidence:"Strong — graded running return for iliopsoas bursitis / snapping hip" },
      ]},
    ],
    treatment:[
      { name:"Ultrasound-Guided Bursal Injection", desc:"Corticosteroid into iliopsoas bursa under ultrasound guidance. Rapid pain relief — allows physiotherapy window.", evidence:"Moderate — short-term pain relief for acute iliopsoas bursitis" },
      { name:"Iliopsoas Tendon Injection (snapping)", desc:"Ultrasound-guided injection of local anaesthetic + corticosteroid into iliopsoas tendon sheath.", evidence:"Moderate — injection reduces snapping frequency in refractory iliopsoas tendon syndrome" },
      { name:"Surgical Release (refractory)", desc:"Arthroscopic or open lengthening of iliopsoas tendon at lesser trochanter if failed 6-month conservative management.", evidence:"Moderate — surgical lengthening for refractory internal snapping hip" },
    ]
  },
];

// ── ALL_TESTS ──
const ALL_TESTS = {
  home:{ label:"Home", icon:"🏠", desc:"App Overview & Features", groups:{ "Welcome":"HOME_MODULE" }},
  dashboard:{ label:"Dashboard", icon:"📊", desc:"Therapist Overview", groups:{ "Therapist Dashboard":"DASHBOARD_MODULE" }},
  subjective:{ label:"Subjective", icon:"📝", desc:"History & Complaint", groups:{ "Full Subjective Assessment":"SUBJECTIVE_MODULE" }},
  palpation:{ label:"Palpation", icon:"🖐️", desc:"Tissue Assessment", groups:{ "Palpation Findings":"PALPATION_MODULE" }},
  posture:{ label:"Posture", icon:"🧍", desc:"Postural Analysis", groups:{
    "Posture Defect Assessment":"POSTURE_DEFECT_MODULE",
  }},
  rom:{ label:"ROM", icon:"📐", desc:"Range of Motion", groups:{ "Full ROM Assessment":"ROM_MODULE" }},
  mmt:{ label:"Muscle MMT", icon:"💪", groups:{ "Full MMT Assessment":"MMT_MODULE" }},
  special:{ label:"Special Tests (100+)", icon:"🔬", groups:{ "All Special Tests":"SPECIAL_TESTS_MODULE" }},
  neuro:{ label:"Neurological", icon:"⚡", groups:{ "Full Neurological Assessment":"NEURO_MODULE" }},
  gait:{ label:"Gait Analysis", icon:"🚶", groups:{ "Full Gait Analysis":"GAIT_MODULE" }},
  nkt:{ label:"NKT Assessment", icon:"🧠", groups:{ "Region-Specific NKT Tests":"NKT_REGION" }},
  kinetic:{ label:"Kinetic Chain", icon:"⛓️", groups:{ "Joint-by-Joint Assessment":"KC_REGION" }},
  fascia:{ label:"Fascia Integration", icon:"🕸️", groups:{ "Fascial Assessment":"FASCIA_REGION" }},
  fma:{ label:"Functional Movement", icon:"🏃", groups:{ "Movement Analysis":"FMA_REGION" }},
  cyriax_full:{ label:"Cyriax Full Assessment", icon:"🦴", groups:{ "Complete STTT Assessment":"CYRIAX_MODULE" }},
  outcome:{ label:"Outcome Measures", icon:"📈", groups:{ "Validated Outcome Measures":"OUTCOME_MODULE" }},
  exercise:{ label:"Treatment Prescription", icon:"💊", desc:"Exercise & Treatment Plan", groups:{ "Exercise Prescription":"EXERCISE_MODULE" }},
  tx_techniques:{ label:"Tx Techniques", icon:"🤲", groups:{ "Treatment Techniques":"TX_TECHNIQUES_MODULE" }},
  tx_sessions:{ label:"Session Log", icon:"📋", groups:{ "Treatment Session Log":"TX_SESSION_MODULE" }},
  soap:{ label:"SOAP + AI", icon:"🤖", desc:"AI-Powered SOAP Notes", groups:{ "SOAP Note Generator":"SOAP_MODULE" }},
};

// ── ROM_DATA ──
const ROM_DATA={
  "Cervical":[
    {id:"rom_cflex",mv:"Flexion",bilateral:false,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal (coronal)",
     start:"Seated, head neutral, stabilise thorax",gonio:"Axis: C7 SP; Fixed: vertical ref; Moving: along mastoid/ear",
     muscles:"Sternocleidomastoid, longus colli/capitis, anterior scalenes",
     endfeel:{normal:"Firm (ligamentous — posterior structures)",abnormal:"Hard=OA/disc; Empty=fracture/neoplasm; Springy=meniscoid"},
     compensation:"Thoracic flexion, chin poke (forward head)",
     capsular:"Lateral flex=Rot>Flex=Ext (cervical facet capsular pattern)",
     adl:"Looking down at phone, eating, reading",
     pathology:"Limited painfully: disc herniation (C4/5 or C5/6), facet OA; painless: muscle tightness",
     redflag:"Bilateral arm paresthesia on flex = cord compression; trauma + limited = C-spine fracture protocol",
     pediatric:"Neonatal: limited = torticollis, Klippel-Feil. Children: normal=80°",
     geriatric:"Degenerative changes reduce all planes by 25–30% by age 70"},
    {id:"rom_cext",mv:"Extension",bilateral:false,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Seated, head neutral",gonio:"Axis: C7 SP; Fixed: vertical ref; Moving: along mastoid",
     muscles:"Semispinalis capitis, splenius capitis, upper trapezius, suboccipitals",
     endfeel:{normal:"Firm (anterior ligaments)",abnormal:"Hard=OA/stenosis; Empty=instability; Springy=disc"},
     compensation:"Thoracic extension, mouth opening",
     capsular:"Extension often more limited than flexion in degenerative disease",
     adl:"Looking up at ceiling, overhead activities, reversing car",
     pathology:"Limited: cervical stenosis, OA, disc osteophyte. Pain on ext: facet compression",
     redflag:"Bilateral LE symptoms on extension = spinal stenosis. Dizziness = VBI — stop, perform VBI screen"},
    {id:"rom_clatl",mv:"Lat Flex L",bilateral:false,normal:45,unit:"°",plane:"Frontal",axis:"AP (anterior-posterior)",
     start:"Seated, stabilise ipsilateral shoulder to prevent elevation",gonio:"Axis: C7 SP; Fixed: vertical; Moving: along midline skull",
     muscles:"Ipsilateral: scalenes, SCM, upper trap, splenius; Contralateral: stretched",
     endfeel:{normal:"Firm (contralateral capsule + muscles)",abnormal:"Hard=OA/Unco; Springy=disc"},
     compensation:"Shoulder elevation (shrug), trunk lateral lean",
     capsular:"Asymmetric restriction: facet OA pattern",
     adl:"Ear to shoulder stretch, lateral reach activities",
     pathology:"Unilateral limitation: unilateral facet OA, disc herniation, scalene tightness",
     redflag:"Arm pain reproduced = radiculopathy (C4–C8). Lhermitte's sign on any cervical movement = cord lesion"},
    {id:"rom_clatr",mv:"Lat Flex R",bilateral:false,normal:45,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, stabilise contralateral shoulder",gonio:"Axis: C7 SP; Fixed: vertical; Moving: along skull midline",
     muscles:"Ipsilateral scalenes, SCM, upper trap, splenius capitis/cervicis",
     endfeel:{normal:"Firm",abnormal:"Hard=OA; Empty=trauma"},
     compensation:"Shoulder elevation, trunk lean opposite direction",
     capsular:"Compare L vs R: asymmetry >10° clinically significant",
     adl:"Phone held to ear, lateral reaching",
     pathology:"Same as Lat Flex L — compare sides for asymmetry",
     redflag:"Pain down ipsilateral arm = Spurling's positive cluster"},
    {id:"rom_crotl",mv:"Rotation L",bilateral:false,normal:60,unit:"°",plane:"Transverse",axis:"Vertical (longitudinal)",
     start:"Seated, head neutral, stabilise thorax",gonio:"Axis: crown of head; Fixed: acromial line; Moving: nose direction",
     muscles:"Contralateral SCM, ipsilateral splenius, suboccipitals",
     endfeel:{normal:"Firm (capsule + alar ligament)",abnormal:"Hard=OA/fixation; Springy=disc protrusion"},
     compensation:"Trunk rotation, chin elevation",
     capsular:"Rotation most limited in atlantoaxial OA (C1/C2)",
     adl:"Checking blind spot driving, looking sideways",
     pathology:"C1/2 OA: rotation limited bilaterally. Disc: often asymmetric + painful arc",
     redflag:"<30° rotation = atlantoaxial instability or end-stage OA. VBI symptoms: dizziness, nystagmus, diplopia"},
    {id:"rom_crotr",mv:"Rotation R",bilateral:false,normal:60,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same method",
     muscles:"Same contralateral pattern as rotation L",
     endfeel:{normal:"Firm",abnormal:"Same as rotation L"},
     compensation:"Trunk rotation, chin elevation",
     capsular:"RA: atlantoaxial instability — bilateral rotation severely limited",
     adl:"Same as rotation L",
     pathology:"Unilateral loss: facet OA, unilateral disc; Bilateral equal loss: C1/2",
     redflag:"RA patient: odontoid fracture risk — <30° rotation → X-ray"},
  ],
  "Thoracic":[
    {id:"rom_thflex",mv:"Flexion",bilateral:false,normal:50,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Seated or standing, arms crossed",gonio:"Axis: T12; Fixed: vertical; Moving: spinous process line",
     muscles:"Rectus abdominis, external obliques",
     endfeel:{normal:"Firm (posterior ligaments + facets)",abnormal:"Hard=OA/AS; Springy=disc (rare thoracic)"},
     compensation:"Lumbar flexion (monitor separately), hip flex",
     capsular:"Thoracic: Ext>Lat Flex>Rot in spondylosis; symmetric in AS",
     adl:"Bending forward (combined with lumbar), stooping",
     pathology:"AS: reduced chest expansion + all planes; Osteoporotic wedge: flexion + kyphosis",
     redflag:"Severe flexion pain with percussion tenderness = vertebral fracture. Thoracic mass: bilateral UMN signs"},
    {id:"rom_thext",mv:"Extension",bilateral:false,normal:25,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing or prone, lumbar stabilised",gonio:"Axis: T12; Fixed: vertical; Moving: spinous process",
     muscles:"Erector spinae, multifidus, semispinalis",
     endfeel:{normal:"Firm (anterior longitudinal ligament + disc)",abnormal:"Hard=OA/AS; Empty=malignancy"},
     compensation:"Lumbar hyperextension",
     capsular:"Extension earliest limited in thoracic OA",
     adl:"Upright posture, overhead reach, back bend",
     pathology:"Thoracic kyphosis: extension severely limited; Scheuermann's: fixed kyphosis",
     redflag:"Night pain + weight loss + extension pain = malignancy/infection"},
    {id:"rom_throtl",mv:"Rotation L",bilateral:false,normal:35,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Seated, arms crossed, pelvis fixed",gonio:"Axis: T1; Fixed: pelvis line; Moving: shoulder line",
     muscles:"Ipsilateral internal oblique + contralateral external oblique",
     endfeel:{normal:"Firm",abnormal:"Hard=AS/costovertebral joint restriction"},
     compensation:"Lumbar rotation, trunk lateral lean",
     capsular:"AS: marked bilateral symmetric restriction",
     adl:"Golf swing, tennis serve, trunk twisting in daily life",
     pathology:"Costovertebral joint restriction: local thoracic pain + limited ipsilateral rotation",
     redflag:"Rib pain with rotation = costovertebral joint pathology, stress fracture in athletes"},
    {id:"rom_throtr",mv:"Rotation R",bilateral:false,normal:35,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same",muscles:"Same contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Hard=costovertebral restriction"},
     compensation:"Lumbar rotation",capsular:"Compare L vs R",
     adl:"Same as rotation L",
     pathology:"Asymmetric restriction: scoliosis, unilateral facet OA",
     redflag:"Rib fracture: localized pain + limited rotation + crepitus"},
  ],
  "Lumbar":[
    {id:"rom_lflex",mv:"Flexion",bilateral:false,normal:60,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing, knees extended; also assess fingertip-to-floor distance (N=<7cm)",gonio:"Axis: S2; Fixed: vertical; Moving: T12 spinous process line; ALTERNATIVE: Schober's test (distraction from S2+10cm line: N≥5cm increase)",
     muscles:"Psoas, rectus abdominis, obliques (assist); Erector spinae eccentric control",
     endfeel:{normal:"Firm (posterior ligaments, disc tension)",abnormal:"Springy=disc herniation; Hard=OA/end-stage; Empty=fracture/malignancy"},
     compensation:"Hip flexion substituting for lumbar flex, thoracic flexion, knee bend",
     capsular:"Lumbar capsular: Ext>Lat Flex>Rot (facet joints)",
     adl:"Picking up objects, dressing, tying shoes, toileting",
     pathology:"Limited painfully: disc herniation, acute facet lock, spondylolisthesis; Painful return from flexion = disc",
     redflag:"Bowel/bladder symptoms + LBP = cauda equina — URGENT. Painful arc in flexion/return = disc pathology"},
    {id:"rom_lext",mv:"Extension",bilateral:false,normal:25,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing, hands on posterior iliac crests for stabilisation",gonio:"Axis: greater trochanter; Fixed: vertical; Moving: mid-axillary line",
     muscles:"Erector spinae, multifidus, quadratus lumborum",
     endfeel:{normal:"Firm (anterior disc/ALL + facet joint approximation)",abnormal:"Hard=OA severe; Springy=facet impingement; Empty=instability"},
     compensation:"Hip extension (gluteal contraction), knee flexion",
     capsular:"Facet OA: extension most limited + painful",
     adl:"Standing from seated, walking, reaching overhead, bending backward",
     pathology:"Limited painfully: facet OA, spondylolysis/listhesis, spinal stenosis; Pain in extension = neurogenic claudication",
     redflag:"Bilateral leg pain on extension relieved by sitting = spinal stenosis. Instability = spondylolisthesis (step sign)"},
    {id:"rom_llfl",mv:"Lat Flex L",bilateral:false,normal:25,unit:"°",plane:"Frontal",axis:"AP",
     start:"Standing, knees extended, arms at sides — measure fingertip distance traveled down leg",gonio:"Axis: S2; Fixed: vertical; Moving: T12 SP",
     muscles:"Ipsilateral: QL, erector spinae, obliques; Contralateral: stretched",
     endfeel:{normal:"Firm (contralateral ligaments + muscles)",abnormal:"Hard=OA/scoliosis; Springy=disc"},
     compensation:"Trunk rotation, lateral hip shift, knee flexion",
     capsular:"Asymmetric restriction: unilateral facet OA or disc herniation",
     adl:"Side bending for reaching, lateral reaching in ADLs",
     pathology:"Painful limited: disc herniation (list toward or away from disc depending on HNP position relative to nerve root)",
     redflag:"Lateral list: disc herniation or muscle spasm. Scoliosis: structural vs functional"},
    {id:"rom_llfr",mv:"Lat Flex R",bilateral:false,normal:25,unit:"°",plane:"Frontal",axis:"AP",
     start:"Same as Lat Flex L",gonio:"Same",muscles:"Same contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Springy=disc"},
     compensation:"Trunk rotation, hip shift",capsular:"Compare L vs R",
     adl:"Same",pathology:"Compare with L — asymmetry >10° significant",
     redflag:"Painful list = disc pathology — assess dermatomes"},
    {id:"rom_lrotl",mv:"Rotation L",bilateral:false,normal:5,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Seated, arms crossed, pelvis fixed to chair",gonio:"Axis: midline between PSIS; Fixed: pelvis; Moving: shoulder girdle line",
     muscles:"Ipsilateral internal oblique + multifidus; Contralateral external oblique",
     endfeel:{normal:"Firm (disc + capsule)",abnormal:"Hard=OA; Springy=disc"},
     compensation:"Pelvic rotation, trunk lateral lean",
     capsular:"NOTE: lumbar rotation is very limited (5°) — restriction most significant in acute disc",
     adl:"Rolling in bed, getting in/out of car, twisting",
     pathology:"Painful rotation: disc herniation (early sign), spondylodiscitis; Symmetric loss: AS",
     redflag:"Severe bilateral rotation loss + SI joint involvement = AS — check BASMI"},
    {id:"rom_lrotr",mv:"Rotation R",bilateral:false,normal:5,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Same as rotation L",gonio:"Same",muscles:"Same",
     endfeel:{normal:"Firm",abnormal:"Springy=disc"},
     compensation:"Pelvic rotation",capsular:"Compare L vs R",
     adl:"Same",pathology:"Same as rotation L",redflag:"Same"},
  ],
  "TMJ":[
    {id:"rom_topen",mv:"Mouth Opening",bilateral:false,normal:45,unit:"mm",plane:"Sagittal",axis:"Frontal",
     start:"Seated, teeth in crest-to-crest occlusion; measure interincisal distance",gonio:"Ruler: between upper and lower central incisors",
     muscles:"Bilateral lateral pterygoid, digastric, mylohyoid (opening); masseter, temporalis, medial pterygoid (close)",
     endfeel:{normal:"Firm (muscle/capsule at end range)",abnormal:"Springy=anterior disc displacement with reduction (click); Hard=bony block/closed lock; Empty=acute inflammation"},
     compensation:"Forward head posture to gain opening, jaw deviation (note deviation direction)",
     capsular:"TMJ capsular: limitation in opening=protrusion=contralateral deviation (ipsilateral condyle restriction)",
     adl:"Eating, yawning, talking, dental treatment",
     pathology:"<30mm = significant trismus; Clicking with opening: disc displacement with reduction; No click + limited: disc displacement without reduction (closed lock)",
     redflag:"Sudden inability to open after locking = closed lock — urgent referral. Trismus + fever = infection"},
    {id:"rom_tlatl",mv:"Lat Deviation L",bilateral:false,normal:10,unit:"mm",plane:"Frontal",axis:"Vertical",
     start:"Seated, mouth slightly open, measure deviation of lower midline from upper",gonio:"Ruler from upper to lower central incisor midlines",
     muscles:"Ipsilateral medial pterygoid + contralateral lateral pterygoid",
     endfeel:{normal:"Firm",abnormal:"Hard=bony block; Limited=ipsilateral disc; Painful=synovitis"},
     compensation:"Head tilt to compensate",capsular:"Reduced ipsilateral deviation = ipsilateral disc/capsule restriction",
     adl:"Chewing (lateral grinding movement)",
     pathology:"Deviation toward affected side on opening = ipsilateral disc or muscle pathology",
     redflag:"Unilateral deviation + pain + swelling = septic arthritis or condylar fracture"},
    {id:"rom_tlatr",mv:"Lat Deviation R",bilateral:false,normal:10,unit:"mm",plane:"Frontal",axis:"Vertical",
     start:"Same",gonio:"Same",muscles:"Contralateral pattern",
     endfeel:{normal:"Firm",abnormal:"Hard/Springy"},
     compensation:"Head tilt",capsular:"Compare L vs R",adl:"Chewing",pathology:"Same as L",redflag:"Same"},
    {id:"rom_tpro",mv:"Protrusion",bilateral:false,normal:8,unit:"mm",plane:"Sagittal",axis:"Frontal",
     start:"Seated, teeth together; measure forward movement of lower incisor beyond upper",gonio:"Ruler measurement",
     muscles:"Bilateral lateral pterygoid",
     endfeel:{normal:"Firm (temporomandibular ligament)",abnormal:"Hard=bony/OA; Reduced=capsular restriction"},
     compensation:"Forward head posture",capsular:"Reduced protrusion: bilateral capsular pattern",
     adl:"Chewing tough foods, mandibular positioning",
     pathology:"Reduced protrusion: bilateral disc displacement, OA, fibrosis post-infection",
     redflag:"Malocclusion post-trauma = condylar fracture"},
  ],
  "Shoulder":[
    {id:"rom_sflex",mv:"Flexion",bilateral:true,normal:180,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or seated; scapula stabilised after 60°",gonio:"Axis: lateral shoulder (GH joint); Fixed: mid-axillary line; Moving: lateral humerus to lateral epicondyle",
     muscles:"Anterior deltoid, coracobrachialis (0–90°); upper trap + serratus anterior (scapular upward rotation 60–180°)",
     endfeel:{normal:"Firm (posterior capsule + infraspinatus/teres minor)",abnormal:"Hard=OA/calcification; Springy=subacromial impingement; Empty=septic/acute RC tear"},
     compensation:"Trunk extension (lean back), elbow flex, shoulder hike (upper trap), scapular winging",
     capsular:"GH capsular pattern: ER>Abd>IR (Cyriax); impingement pattern: painful arc 60–120°",
     adl:"Reaching overhead (shelf, hair wash), throwing, swimming",
     pathology:"Arc 60–120°: impingement or partial RC. Arc 120–180° on ascent: AC joint. Full loss: frozen shoulder",
     redflag:"Sudden painless loss after trauma = complete RC tear. Fever + hot joint = septic arthritis"},
    {id:"rom_sext",mv:"Extension",bilateral:true,normal:60,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Prone or standing; stabilise scapula to prevent anterior tipping",gonio:"Axis: lateral GH; Fixed: mid-axillary line; Moving: lateral humerus",
     muscles:"Posterior deltoid, teres major, latissimus dorsi, long head triceps",
     endfeel:{normal:"Firm (anterior capsule + coracohumeral ligament)",abnormal:"Hard=OA; Springy=biceps long head"},
     compensation:"Trunk flexion, scapular anterior tipping, shoulder IR",
     capsular:"Extension less affected in GH capsular pattern than ER/Abd",
     adl:"Reaching behind back (hand to back pocket, bra hook), pushing off from chair",
     pathology:"Limited: anterior capsule tightness, biceps tendon pathology, pec major tightness",
     redflag:"Pain at extreme extension = anterior instability, SLAP lesion"},
    {id:"rom_sabd",mv:"Abduction",bilateral:true,normal:180,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, elbow extended, thumb up (scapular plane preferred = 30° forward)",gonio:"Axis: posterior GH joint; Fixed: parallel to spine; Moving: posterior humerus",
     muscles:"Supraspinatus (0–15°), deltoid (15–90°), serratus + trap (60–180° scapular rotation)",
     endfeel:{normal:"Firm (inferior GH capsule + adductors)",abnormal:"Hard=OA/calcification; Springy=subacromial impingement; Empty=fracture/acute tear"},
     compensation:"Trunk lateral lean (Trendelenburg shoulder), shoulder hike, scapular winging, elbow flex",
     capsular:"Primary GH restriction: ER>Abd>IR. Assess scapulohumeral rhythm (N = 2:1 GH:scap ratio)",
     adl:"Reaching out to side, dressing (arm into sleeve), carrying objects at side",
     pathology:"Arc 60–120°: impingement or partial RC; Full loss: frozen shoulder, GH OA, complete RC tear",
     redflag:"Acute painful arc + weakness + trauma = complete RC tear. Document scapulohumeral rhythm deviation"},
    {id:"rom_sadd",mv:"Adduction",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, assess cross-body adduction (horizontal adduction)",gonio:"Axis: anterior GH; Fixed: acromion to acromion line; Moving: humerus",
     muscles:"Pec major, latissimus dorsi, teres major, anterior deltoid",
     endfeel:{normal:"Soft (arm contact with trunk) or firm",abnormal:"Pain at extreme: AC joint pathology (horizontal add)"},
     compensation:"Trunk lean",capsular:"AC joint positive: horizontal adduction most painful",
     adl:"Hugging, crossing arms, ADL cross-body reach",
     pathology:"Horizontal adduction pain: AC joint OA, ACJ injury, subacromial pathology",
     redflag:"Cross-body pain after fall = ACJ sprain — assess step deformity"},
    {id:"rom_ser",mv:"ER",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, shoulder 0° abduction, elbow 90°; ALSO test at 90° abduction",gonio:"Axis: olecranon; Fixed: vertical/perpendicular to table; Moving: ulna/forearm",
     muscles:"Infraspinatus, teres minor, posterior deltoid",
     endfeel:{normal:"Firm (anterior capsule + subscapularis)",abnormal:"Hard=OA; Springy=impingement; Empty=acute"},
     compensation:"Shoulder elevation, trunk rotation, scapular protraction",
     capsular:"ER most limited in GH capsular pattern (frozen shoulder) — key diagnostic finding",
     adl:"Combing hair, overhead reach, throwing wind-up",
     pathology:"ER loss primary sign of GH capsular restriction. ER loss at 90° = posterior capsule tightness → impingement",
     redflag:"ER lag sign (passive > active by >5°) = infraspinatus tear. Profound ER weakness = axillary nerve injury"},
    {id:"rom_sir",mv:"IR",bilateral:true,normal:70,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, shoulder 0° abduction, elbow 90°; assess thumb-to-back (functional IR) = N: T8–T10 level",gonio:"Axis: olecranon; Fixed: vertical; Moving: ulna",
     muscles:"Subscapularis, anterior deltoid, teres major, pec major, latissimus",
     endfeel:{normal:"Firm (posterior capsule + muscles)",abnormal:"Hard=OA; Springy=posterior capsule restriction"},
     compensation:"Shoulder protraction, trunk rotation, scapular anterior tipping",
     capsular:"Posterior capsule tightness: IR limited → GIRD (glenohumeral internal rotation deficit) in throwers",
     adl:"Reaching behind back, bra hook, tucking shirt, toileting",
     pathology:"GIRD: IR loss >15° vs opposite in overhead athletes → impingement risk. Posterior labral tear",
     redflag:"Internal rotation lag sign = subscapularis tear. Belly press weakness = subscapularis rupture"},
    {id:"rom_shabd",mv:"Horiz Abduction",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine or seated, shoulder 90° abduction → assess horizontal abd",gonio:"Axis: AC joint; Fixed: acromion line; Moving: humerus",
     muscles:"Posterior deltoid, infraspinatus, teres minor",
     endfeel:{normal:"Firm (anterior capsule + pec major)",abnormal:"Springy=posterior capsule impingement"},
     compensation:"Trunk rotation",capsular:"Horizontal ABD stretches posterior capsule: reproduce posterior shoulder pain",
     adl:"Throwing follow-through, backstroke",
     pathology:"Limited horizontal ABD + posterior pain: posterior capsule tightness or posterior labral tear",
     redflag:"Instability testing: apprehension with horizontal ABD + ER = anterior instability"},
    {id:"rom_shadd",mv:"Horiz Adduction",bilateral:true,normal:135,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Shoulder 90° flex → add horizontally across body",gonio:"Axis: posterior GH; Fixed: shoulder line; Moving: humerus",
     muscles:"Pec major (sternal), anterior deltoid, coracobrachialis",
     endfeel:{normal:"Soft (contact) or firm",abnormal:"Pain at end: AC joint pathology"},
     compensation:"Trunk rotation",capsular:"AC joint: positive horizontal ADD — Scarf/cross-body test",
     adl:"Reaching across body, hugging",
     pathology:"Horizontal ADD pain at AC joint = AC pathology (Scarf test); posterior = subacromial",
     redflag:"AC joint injury grading: I (sprain), II (ACJ step), III (complete)"},
  ],
  "Elbow":[
    {id:"rom_eflex",mv:"Flexion",bilateral:true,normal:145,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Anatomical position, forearm supinated",gonio:"Axis: lateral epicondyle; Fixed: lateral humerus mid-axillary; Moving: lateral forearm to radial styloid",
     muscles:"Biceps brachii, brachialis, brachioradialis",
     endfeel:{normal:"Soft (muscle bulk contact) or hard (bone-to-bone in lean patients)",abnormal:"Hard (osteophyte/loose body); Springy (anterior capsule issue)"},
     compensation:"Shoulder flex/abd to assist",capsular:"Elbow capsular: Flex>Ext (lateral pivot shift pattern)",
     adl:"Feeding, grooming, phone use, pulling objects",
     pathology:"Limited flex: posterior osteophyte, loose body, OA; pain at end range: posterior impingement",
     redflag:"Effusion: check fat pad sign (X-ray). Valgus stress pain with flexion = UCL injury"},
    {id:"rom_eext",mv:"Extension",bilateral:true,normal:0,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Anatomical position",gonio:"Same as flexion",
     muscles:"Triceps brachii, anconeus",
     endfeel:{normal:"Hard (bone-to-bone: olecranon in fossa)",abnormal:"Firm (capsular — common in OA); Springy (loose body)"},
     compensation:"Shoulder elevation, wrist flex",capsular:"Extension loss primary sign elbow OA/capsular",
     adl:"Pushing, pressing, reaching far, overhead work",
     pathology:"Extension loss: OA, posterior impingement, loose body, flexion contracture post-fracture; Hyperextension: laxity/UCL injury",
     redflag:"Extension loss after trauma = fracture (radial head, coronoid). Hyperextension = posterior dislocation risk"},
    {id:"rom_esup",mv:"Supination",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Longitudinal",
     start:"Elbow 90° flexion, arm at side (eliminates shoulder rotation compensation)",gonio:"Axis: third finger; Fixed: parallel to humerus; Moving: dorsal forearm/pencil held in hand",
     muscles:"Biceps brachii (primary), supinator",
     endfeel:{normal:"Firm (interosseous membrane, pronator teres, oblique cord)",abnormal:"Hard=radial head OA/DRUJ arthritis; Springy=ligamentous"},
     compensation:"Shoulder ER, trunk rotation",capsular:"DRUJ capsular: supination>pronation",
     adl:"Receiving change, carrying soup bowl, turning door handle (external knob), hammering upward blow",
     pathology:"Limited supination: radial head fracture/OA, DRUJ arthritis, interosseous membrane injury",
     redflag:"Supination pain + lateral elbow = radial head fracture post-fall. DRUJ dislocation"},
    {id:"rom_epro",mv:"Pronation",bilateral:true,normal:90,unit:"°",plane:"Transverse",axis:"Longitudinal",
     start:"Elbow 90° flexion, arm at side",gonio:"Same as supination",
     muscles:"Pronator teres, pronator quadratus",
     endfeel:{normal:"Firm (interosseous membrane + supinator stretch)",abnormal:"Hard=DRUJ OA; Empty=acute fracture"},
     compensation:"Shoulder IR, trunk rotation",capsular:"DRUJ: pronation often better preserved than supination",
     adl:"Typing, cutting food, writing, pouring liquid",
     pathology:"Limited pronation: DRUJ arthritis, distal radius malunion, interosseous membrane",
     redflag:"Loss after distal radius fracture = DRUJ injury. Pronator syndrome: painful pronation + median nerve symptoms"},
  ],
  "Wrist":[
    {id:"rom_wflex",mv:"Wrist Flexion",bilateral:true,normal:80,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Forearm supported in pronation, wrist neutral",gonio:"Axis: lateral wrist (triquetrum); Fixed: ulna; Moving: 5th metacarpal",
     muscles:"FCR, FCU, palmaris longus; FDP/FDS assist",
     endfeel:{normal:"Firm (posterior capsule + extensor muscle stretch)",abnormal:"Hard=OA/Kienböck; Springy=TFCC/SL ligament"},
     compensation:"Forearm supination, finger extension",capsular:"Wrist capsular: flex=ext restriction in symmetry (capsular) or asymmetric (ligamentous)",
     adl:"Typing (neutral preferred), prayer position, push-up position",
     pathology:"Limited painful flex: dorsal ganglia, DISI instability, dorsal wrist impingement; Wrist OA",
     redflag:"Limited + painful with swelling = scaphoid fracture (snuffbox tenderness). TFCC: ulnar sided pain + limited"},
    {id:"rom_wext",mv:"Wrist Extension",bilateral:true,normal:70,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Forearm supported in pronation",gonio:"Axis: lateral wrist; Fixed: ulna; Moving: 5th metacarpal",
     muscles:"ECRL, ECRB, ECU",
     endfeel:{normal:"Firm (anterior capsule + flexor stretch)",abnormal:"Hard=OA; Springy=volar plate laxity"},
     compensation:"Forearm pronation, finger flex",capsular:"Wrist OA: both flex and ext equally limited",
     adl:"Push-up, weight bearing on hands, typing (slight extension), keyboard use",
     pathology:"Limited extension: tennis elbow (wrist ext pain); distal radius fracture malunion; volar ganglia",
     redflag:"<30° extension after Colles fracture = malunion — DRUJ check"},
    {id:"rom_wrad",mv:"Radial Deviation",bilateral:true,normal:20,unit:"°",plane:"Frontal",axis:"AP",
     start:"Forearm pronated on table, wrist neutral",gonio:"Axis: middle of wrist (capitate); Fixed: forearm midline; Moving: 3rd metacarpal",
     muscles:"FCR (with ECRL), APL, EPB",
     endfeel:{normal:"Firm (ulnar collateral ligament + ECU/FCU)",abnormal:"Hard=OA/scaphoid impingement; Springy=radial styloid"},
     compensation:"Forearm supination",capsular:"RA: radial deviation restricted early",
     adl:"Keyboard use, pouring, hammering",
     pathology:"Limited radial deviation: scaphoid OA, radial styloid impingement, intersection syndrome",
     redflag:"Painful radial deviation after fall = de Quervain's (Finkelstein test). Scaphoid fracture"},
    {id:"rom_wuln",mv:"Ulnar Deviation",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Forearm pronated on table, wrist neutral",gonio:"Same as radial deviation",
     muscles:"FCU, ECU",
     endfeel:{normal:"Firm (radial collateral ligament + muscles)",abnormal:"Hard=OA; Springy=TFCC"},
     compensation:"Forearm pronation",capsular:"RA: ulnar deviation is deformity direction — assess actively",
     adl:"Hammering, wringing, reaching lateral objects",
     pathology:"TFCC injury: painful ulnar deviation; Ulnar impaction: ulnar wrist pain + limited ulnar dev",
     redflag:"RA: ulnar drift deformity — do not force ulnar deviation. TFCC + ulnar impaction"},
  ],
  "Hand & Fingers":[
    {id:"rom_mcp",mv:"MCP Flexion",bilateral:true,normal:90,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Wrist neutral, assess each finger MCP individually",gonio:"Axis: dorsal MCP joint; Fixed: metacarpal shaft; Moving: proximal phalanx dorsum",
     muscles:"Flexor digitorum superficialis/profundus, lumbricals, interossei",
     endfeel:{normal:"Firm (collateral ligaments + joint capsule)",abnormal:"Springy=flexor tenosynovitis; Hard=OA/Dupuytren"},
     compensation:"Wrist flexion, finger abd/add",capsular:"RA: MCP volar subluxation + ulnar drift — assess passively with care",
     adl:"Gripping, keyboard, writing, pinching",
     pathology:"Limited MCP flex: Dupuytren's contracture, flexor tenosynovitis, RA/OA, post-fracture",
     redflag:"Sudden triggering = trigger finger (stenosing tenosynovitis). RA: MCPs swollen bilaterally = synovitis"},
    {id:"rom_pip",mv:"PIP Flexion",bilateral:true,normal:100,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"MCP neutral, assess each PIP",gonio:"Axis: lateral PIP; Fixed: proximal phalanx; Moving: middle phalanx",
     muscles:"FDS (primary PIP flexor)",
     endfeel:{normal:"Soft (tissue contact, lean) or firm",abnormal:"Springy=volar plate laxity; Hard=OA/bony block"},
     compensation:"MCP flex, wrist flex",capsular:"PIP capsular: flex>ext",
     adl:"All grip functions",
     pathology:"PIP limited: Boutonnière deformity (RA/trauma), volar plate injury, fracture, post-immobilisation contracture",
     redflag:"PIP swelling after injury = volar plate avulsion (jammed finger). Boutonnière = PIP flex + DIP ext deformity"},
    {id:"rom_dip",mv:"DIP Flexion",bilateral:true,normal:90,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"PIP in extension; assess DIP flex/ext",gonio:"Axis: lateral DIP; Fixed: middle phalanx; Moving: distal phalanx",
     muscles:"FDP (sole DIP flexor)",
     endfeel:{normal:"Firm (dorsal capsule + extensor mechanism)",abnormal:"Hard=Heberden's nodes (OA); Springy=extensor mechanism"},
     compensation:"PIP flex",capsular:"DIP: OA causes Heberden's nodes + limited flex",
     adl:"Fine pinch, typing, intricate hand work",
     pathology:"DIP extension loss: mallet finger (extensor digitorum avulsion). DIP OA: Heberden's nodes",
     redflag:"Mallet finger: DIP rests in flex, cannot actively extend = extensor avulsion — splint 6 weeks"},
    {id:"rom_thopp",mv:"Thumb Opposition",bilateral:true,normal:null,unit:"",plane:"Multi",axis:"Multi",
     start:"Assess little finger pad contact with thumb pad",gonio:"Kapandji index (0–10 scale): 0=thumb cannot reach index; 10=full opposition past little finger base",
     muscles:"Opponens pollicis, FPB, APB, FPL",
     endfeel:{normal:"Firm (1st CMC joint + AdPoll + EP)",abnormal:"Hard=CMC OA; Springy=UCL laxity (Skier's thumb)"},
     compensation:"Wrist flex, forearm pronation",capsular:"1st CMC OA: adduction + extension most limited → Z-deformity",
     adl:"Pinching, writing, buttoning, feeding, key grip",
     pathology:"CMC OA (common in women >50): adduction/extension limited → pain base thumb. CTS: APB weakness → opposition weakness",
     redflag:"CMC OA grading: I (ligamentous laxity), II–IV (progressive narrowing). Grind test positive"},
    {id:"rom_thabdm",mv:"Thumb Abd/Ext",bilateral:true,normal:70,unit:"°",plane:"Frontal",axis:"AP",
     start:"Wrist neutral, thumb alongside index; palmar abduction (out of palm plane)",gonio:"Axis: 1st MCP; Fixed: 1st metacarpal; Moving: proximal phalanx",
     muscles:"APB, APL (abduction); EPL, EPB (extension)",
     endfeel:{normal:"Firm (adductor pollicis + 1st dorsal interosseous)",abnormal:"Hard=1st CMC OA; Springy=UCL"},
     compensation:"Wrist radial deviation",capsular:"1st CMC: abduction + extension restriction in OA",
     adl:"Holding large objects, typing space bar, jar opening",
     pathology:"de Quervain's: APL/EPB tenosynovitis — painful abduction; Limited: CMC OA",
     redflag:"UCL injury (Skier's thumb): valgus stress test at MCP. Stener lesion = surgical"},
  ],
  "Hip":[
    {id:"rom_hflex",mv:"Flexion",bilateral:true,normal:120,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, knee flexed (eliminates hamstring restriction) — assess also with knee extended",gonio:"Axis: greater trochanter; Fixed: mid-axillary line; Moving: lateral femur to lateral condyle",
     muscles:"Iliopsoas (primary), rectus femoris, TFL, sartorius",
     endfeel:{normal:"Soft (anterior thigh-abdomen contact) or firm",abnormal:"Firm early=capsular/OA; Hard=CAM impingement; Empty=acute"},
     compensation:"Lumbar flexion (monitor: loss of lordosis), contralateral hip flex, posterior pelvic tilt",
     capsular:"Hip capsular: IR>Flex>Abd (late stage: all planes)",
     adl:"Sitting, stair climbing, getting out of car, sexual activity, tying shoes",
     pathology:"Limited flex: hip OA (capsular), CAM/pincer FAI, iliopsoas tendinopathy, labral tear",
     redflag:"Groin pain at end-range flex = labral tear (FADIR positive). Trauma + loss = fracture/dislocation"},
    {id:"rom_hext",mv:"Extension",bilateral:true,normal:20,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Prone, stabilise pelvis; knee extended (test hip capsule) + knee flexed 90° (test iliopsoas)",gonio:"Axis: greater trochanter; Fixed: mid-axillary line; Moving: lateral femur",
     muscles:"Gluteus maximus, hamstrings (knee extended), posterior adductor magnus",
     endfeel:{normal:"Firm (iliofemoral ligament + anterior capsule)",abnormal:"Hard=OA/CAM; Springy=posterior impingement"},
     compensation:"Lumbar hyperextension (anterior pelvic tilt), knee flex (to use hamstrings)",
     capsular:"Hip OA: extension + IR restricted earliest",
     adl:"Walking push-off, stair descending, standing from seated",
     pathology:"Hip ext loss: hip flexor contracture (Thomas test), hip OA, lumbar facet compensation",
     redflag:"Bilateral hip ext loss + fixed flexion = AS. Thomas test positive = psoas/rectus tightness"},
    {id:"rom_habd",mv:"Abduction",bilateral:true,normal:45,unit:"°",plane:"Frontal",axis:"AP",
     start:"Supine, pelvis level; stabilise contralateral ASIS",gonio:"Axis: ASIS; Fixed: ASIS-to-ASIS line; Moving: midline of thigh to midpoint of patella",
     muscles:"Gluteus medius/minimus, TFL, piriformis (at 0° flex)",
     endfeel:{normal:"Firm (adductors + pubofemoral ligament + medial capsule)",abnormal:"Hard=OA/CAM; Springy=labrum"},
     compensation:"Lateral pelvic tilt (hip hike), lumbar lateral flex, trunk lean",
     capsular:"Hip OA: abduction limited with internal rotation (combined movement most restricted)",
     adl:"Getting in/out of car, stepping sideways, putting on trousers/socks",
     pathology:"Limited abd: OA, labral tear (CAM), adductor tightness, Legg-Calvé-Perthes, DDH",
     redflag:"Bilateral abd loss in child = DDH/LCP — urgent referral. Trendelenburg sign = Gmed weakness"},
    {id:"rom_hadd",mv:"Adduction",bilateral:true,normal:30,unit:"°",plane:"Frontal",axis:"AP",
     start:"Supine, move test leg across midline; stabilise contralateral ASIS",gonio:"Axis: ASIS; Fixed: ASIS line; Moving: midline thigh",
     muscles:"Adductor longus/brevis/magnus, gracilis, pectineus",
     endfeel:{normal:"Firm (IT band + abductors + lateral capsule)",abnormal:"Springy=adductor strain; Hard=OA"},
     compensation:"Contralateral pelvis drop, trunk lean ipsilateral",capsular:"Less restricted than abd in OA",
     adl:"Crossing legs, horseback riding",
     pathology:"Painful adduction: adductor strain, osteitis pubis, sports hernia",
     redflag:"Adductor squeeze test <18cmHg = groin strain. Groin pain in child/adolescent = SUFE — urgent X-ray"},
    {id:"rom_her",mv:"ER",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Supine, hip + knee 90° (seated) OR prone, knee 90° (pelvis stabilised)",gonio:"Axis: knee (midpoint); Fixed: vertical; Moving: distal fibula/tibia (pendulum method)",
     muscles:"Piriformis, obturator internus/externus, gemelli, gluteus maximus (posterior fibers)",
     endfeel:{normal:"Firm (anterior capsule + iliofemoral ligament + internal rotators)",abnormal:"Hard=OA; Springy=labral tear"},
     compensation:"Lateral pelvic tilt, lumbar rotation",capsular:"Hip OA: IR more limited than ER (early); Both limited end-stage",
     adl:"Cross-legged sitting, walking toe-out gait, external rotation in sport",
     pathology:"Piriformis syndrome: painful ER + sciatic symptoms; Hip OA: ER preserved longer than IR",
     redflag:"Bilateral ER loss in child = SUFE. Painful ER in trauma = posterior hip dislocation"},
    {id:"rom_hir",mv:"IR",bilateral:true,normal:45,unit:"°",plane:"Transverse",axis:"Vertical",
     start:"Prone knee 90° (most reliable); or supine hip 90°",gonio:"Same pendulum method as ER",
     muscles:"Gluteus medius (anterior), TFL, adductor longus",
     endfeel:{normal:"Firm (posterior capsule + external rotators + ischiofemoral ligament)",abnormal:"Hard=OA/FAI; Empty=acute; Springy=labrum"},
     compensation:"Trunk rotation, pelvic rotation",capsular:"Hip IR FIRST AND MOST LIMITED in early hip OA — key diagnostic sign",
     adl:"Getting in/out of car, sitting cross-legged is limited, pivoting",
     pathology:"IR loss: hip OA (earliest sign), CAM FAI, posterior capsule tightness; GIRD equivalent at hip",
     redflag:"IR loss + groin pain in middle-aged = hip OA. Sudden IR loss in child = SUFE/LCP — X-ray"},
  ],
  "Knee":[
    {id:"rom_kflex",mv:"Flexion",bilateral:true,normal:140,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or prone; assess both actively and passively",gonio:"Axis: lateral knee (lateral condyle); Fixed: lateral femur (greater trochanter to condyle line); Moving: lateral fibula to lateral malleolus",
     muscles:"Hamstrings (primary), gastrocnemius (assists at end range), popliteus (initiates)",
     endfeel:{normal:"Soft (posterior calf-thigh contact) or firm (capsule in lean patients)",abnormal:"Springy=meniscal block; Hard=OA/loose body; Empty=acute hemarthrosis"},
     compensation:"Hip flex to assist, ankle plantar flex to increase apparent knee flex",
     capsular:"Knee capsular: Flex>Ext (3:1 ratio in OA)",
     adl:"Stair climbing (N=85°), sitting (N=90°), squatting (N=130°), kneeling (N=140°)",
     pathology:"Limited flex: knee OA, effusion (30° is maximum comfortable flexion in effusion), patellofemoral OA, quadriceps contracture",
     redflag:"Springy block = meniscal tear (bucket handle). Locked knee = urgent. Haemarthrosis post-trauma = ACL tear"},
    {id:"rom_kext",mv:"Extension",bilateral:true,normal:0,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine; assess extension lag (difference between passive and active extension)",gonio:"Same as flexion",
     muscles:"Quadriceps (rectus femoris, vasti)",
     endfeel:{normal:"Firm (posterior capsule + posterior ligaments) or hard (bone-to-bone in hyperextension)",abnormal:"Springy=posterior impingement; Hard=OA; Soft early=effusion"},
     compensation:"Hip extension, ankle DF",capsular:"Extension loss: OA, post-surgery (arthrofibrosis), hamstring tightness",
     adl:"Walking (requires 0°), stair descent, standing",
     pathology:"Extension lag: quadriceps weakness or patella tendon rupture. Flexion contracture: OA, post-fracture, arthrofibrosis",
     redflag:"Extension lag >10° = quadriceps mechanism injury (patella or patellar tendon). PCL injury = posterior sag"},
  ],
  "Ankle":[
    {id:"rom_adf",mv:"Dorsiflexion",bilateral:true,normal:20,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine or seated (non-weight bearing); also assess weight-bearing lunge test (N ≥ 10cm heel-to-wall)",gonio:"Axis: lateral malleolus; Fixed: fibula shaft; Moving: 5th metatarsal shaft",
     muscles:"Tibialis anterior, EHL, EDL, peroneus tertius",
     endfeel:{normal:"Firm (posterior capsule + Achilles/soleus tension)",abnormal:"Hard=bony block (anterior OA/os trigonum); Springy=anterior impingement; Empty=Achilles rupture"},
     compensation:"Subtalar eversion (to compensate DF with pronation), knee flex, hip flex, anterior trunk lean",
     capsular:"Ankle capsular: PF>DF (Cyriax)",
     adl:"Stair climbing (N=15–20°), squatting, kneeling, gait push-off",
     pathology:"Limited DF: Achilles/soleus tightness (equinus), anterior bony impingement, os trigonum, posterior capsule adhesions",
     redflag:"<10° DF = kinetic chain effects: knee valgus, foot pronation, pelvic anterior tilt in squat. Heel cord: Silfverskiöld test"},
    {id:"rom_apf",mv:"Plantarflexion",bilateral:true,normal:50,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, ankle relaxed",gonio:"Axis: lateral malleolus; Fixed: fibula; Moving: 5th metatarsal",
     muscles:"Gastrocnemius, soleus, tibialis posterior, peroneals, FHL/FDL",
     endfeel:{normal:"Firm (anterior capsule + anterior muscles stretch)",abnormal:"Hard=posterior OA/loose body; Springy=ligamentous"},
     compensation:"Hip IR, trunk lean",capsular:"Plantarflexion less affected than DF in ankle OA",
     adl:"Heel raise, ballet, push-off in walking, cycling",
     pathology:"Limited PF: anterior impingement syndrome, Achilles calcification, anterior capsule adhesion",
     redflag:"Sudden PF loss after push-off = Achilles rupture (Thompson test negative)"},
    {id:"rom_ainv",mv:"Inversion",bilateral:true,normal:35,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, ankle in plantar flex (tests subtalar); assess talar tilt",gonio:"Axis: posterior calcaneus; Fixed: tibia shaft; Moving: posterior calcaneus",
     muscles:"Tibialis posterior, FHL, FDL, tibialis anterior",
     endfeel:{normal:"Firm (lateral ligaments + peroneal muscles)",abnormal:"Springy=ATFL/CFL laxity; Hard=coalition; Empty=acute sprain"},
     compensation:"Tibial IR, knee flex",capsular:"Subtalar: inversion > eversion restriction in subtalar OA",
     adl:"Walking on uneven ground, sand",
     pathology:"Hypermobile inversion: lateral ankle sprain (ATFL/CFL); Limited: subtalar OA, tarsal coalition, peroneal tendinopathy",
     redflag:">35° inversion + pain + swelling post-sprain = grade III ATFL tear — anterior draw test. Ottawa rules: X-ray"},
    {id:"rom_aev",mv:"Eversion",bilateral:true,normal:15,unit:"°",plane:"Frontal",axis:"AP",
     start:"Seated, ankle neutral",gonio:"Axis: posterior calcaneus; Fixed: tibia; Moving: posterior calcaneus",
     muscles:"Peroneus longus/brevis, peroneus tertius, EDB",
     endfeel:{normal:"Firm (medial deltoid ligament + tibialis posterior)",abnormal:"Hard=coalition; Springy=deltoid laxity"},
     compensation:"Tibial ER, knee ext",capsular:"Eversion less commonly restricted than inversion",
     adl:"Walking on uneven ground (medial stability)",
     pathology:"Hypomobile eversion: peroneal tendinopathy, subtalar OA; Hypermobile: deltoid ligament laxity",
     redflag:"Eversion force mechanism injury = deltoid ligament tear (medial ankle) — assess with stress X-ray"},
  ],
  "Foot":[
    {id:"rom_1mtpf",mv:"1st MTP Extension",bilateral:true,normal:70,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Standing (functional) or supine; windlass test: active hallux extension",gonio:"Axis: 1st MTP joint; Fixed: 1st metatarsal; Moving: proximal phalanx plantar surface",
     muscles:"EHL (active); passive: plantar fascia (windlass mechanism)",
     endfeel:{normal:"Firm (plantar plate + FHL + plantar fascia windlass)",abnormal:"Hard=hallux rigidus (OA); Springy=sesamoiditis; Empty=fracture"},
     compensation:"Supination of forefoot, external rotation of limb, early heel rise (antalgic gait)",
     capsular:"1st MTP OA (hallux rigidus): extension severely limited, end-range painful",
     adl:"Walking push-off (requires 65–70° MTP extension), running, going up stairs",
     pathology:"Hallux rigidus: progressive MTP extension loss → antalgic gait with external rotation. Hallux valgus: deviated alignment",
     redflag:"Acute MTP pain + limitation = turf toe (plantar plate sprain) or fracture. Grade III turf toe = surgical"},
    {id:"rom_1mtpp",mv:"1st MTP Flexion",bilateral:true,normal:45,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine, ankle neutral",gonio:"Axis: dorsal MTP; Fixed: 1st metatarsal; Moving: dorsal proximal phalanx",
     muscles:"FHL, FHB",
     endfeel:{normal:"Firm (dorsal capsule + EHL stretch)",abnormal:"Hard=OA; Springy=sesamoid"},
     compensation:"Ankle DF to assist toe flex",capsular:"OA: both flex and ext limited",
     adl:"Running, push-off power",
     pathology:"Limited: hallux rigidus, FHL tenosynovitis (dancer's posterior ankle pain)",
     redflag:"Posterior ankle pain + limited MTP flex in dancer = FHL tenosynovitis or os trigonum"},
    {id:"rom_mtpf2",mv:"2nd–5th MTP Extension",bilateral:true,normal:40,unit:"°",plane:"Sagittal",axis:"Frontal",
     start:"Supine; assess each MTP extension passively",gonio:"Axis: each MTP joint",
     muscles:"EDL, EDB",
     endfeel:{normal:"Firm (plantar plate + FDL)",abnormal:"Springy=plantar plate injury; Hard=OA"},
     compensation:"Hip and knee extension",capsular:"Lesser MTP OA: variable restriction",
     adl:"Walking push-off, running",
     pathology:"Limited/painful MTP ext: Morton's neuroma (not joint), metatarsalgia, stress fracture, plantar plate injury",
     redflag:"2nd MTP dorsal dislocation (Lisfranc injury): severe pain + limited ROM + plantar ecchymosis"},
  ],
};

// ── ROM_REGIONS ──
const ROM_REGIONS=Object.keys(ROM_DATA);

// ── RESTRICTION_GRADE ──
const RESTRICTION_GRADE=(measured,normal)=>{
  if(!measured||!normal) return null;
  const pct=(measured/normal)*100;
  if(pct>=85) return{label:"WNL",color:"#00c97a",pct};
  if(pct>=65) return{label:"Mild",color:"#ffb300",pct};
  if(pct>=40) return{label:"Moderate",color:"#ff8c42",pct};
  return{label:"Severe",color:"#ff4d6d",pct};
};

// ── ROM_REDFLAGS ──
const ROM_REDFLAGS=[
  {test:(mv,val)=>mv.toLowerCase().includes("cervical")&&parseFloat(val)<20,msg:"Cervical ROM <20° — fracture/instability protocol. Do not passively test.",color:"#ff4d6d"},
  {test:(mv,val)=>mv.toLowerCase().includes("ankle dorsiflexion")&&parseFloat(val)<10,msg:"Ankle DF <10° — significant equinus. Kinetic chain assessment required.",color:"#ff8c42"},
  {test:(mv,val)=>mv.toLowerCase().includes("hip ir")&&parseFloat(val)<20,msg:"Hip IR <20° — possible early hip OA or FAI. Labral tear assessment indicated.",color:"#ff8c42"},
  {test:(mv,val)=>mv.toLowerCase().includes("knee flex")&&parseFloat(val)<90,msg:"Knee flexion <90° — functional limitation for ADLs. Effusion assessment needed.",color:"#ff8c42"},
];

// ── DERMATOMES ──
const DERMATOMES = [
  { id:"n_c3",  level:"C3",  region:"Posterior neck / occipital",         reflex:null,    myotome:"Neck lateral flexion",         disc:"C2/3" },
  { id:"n_c4",  level:"C4",  region:"Cape (shoulder top)",                reflex:null,    myotome:"Shoulder elevation (trap)",    disc:"C3/4" },
  { id:"n_c5",  level:"C5",  region:"Lateral arm / deltoid badge",        reflex:"Biceps (C5–C6)", myotome:"Shoulder abduction / elbow flex", disc:"C4/5" },
  { id:"n_c6",  level:"C6",  region:"Lateral forearm / thumb + index",    reflex:"Brachioradialis", myotome:"Wrist extension (ECRL/ECRB)",   disc:"C5/6" },
  { id:"n_c7",  level:"C7",  region:"Middle finger",                       reflex:"Triceps (C6–C7)", myotome:"Elbow extension / wrist flex",  disc:"C6/7" },
  { id:"n_c8",  level:"C8",  region:"Little + ring finger / medial FA",   reflex:null,    myotome:"Finger flexion / intrinsics",  disc:"C7/T1" },
  { id:"n_t1",  level:"T1",  region:"Medial forearm / elbow",             reflex:null,    myotome:"Finger abduction (1st dorsal)", disc:"T1/2" },
  { id:"n_l1",  level:"L1",  region:"Groin / upper anterior thigh",       reflex:null,    myotome:"Hip flexion",                  disc:"L1/2" },
  { id:"n_l2",  level:"L2",  region:"Anterior + medial thigh",            reflex:null,    myotome:"Hip flexion / knee ext (assist)", disc:"L2/3" },
  { id:"n_l3",  level:"L3",  region:"Medial knee / lower anterior thigh", reflex:"Patella (L3–L4)", myotome:"Knee extension (quad)",      disc:"L3/4" },
  { id:"n_l4",  level:"L4",  region:"Medial leg / medial foot",           reflex:"Patella (L3–L4)", myotome:"Ankle dorsiflexion (TA)",    disc:"L4/5" },
  { id:"n_l5",  level:"L5",  region:"Dorsum foot / 1st–2nd web space",    reflex:null,    myotome:"Great toe extension (EHL)",    disc:"L4/5" },
  { id:"n_s1",  level:"S1",  region:"Lateral foot / heel / sole",         reflex:"Achilles (S1)", myotome:"Ankle plantarflexion (gastroc)", disc:"L5/S1" },
  { id:"n_s2",  level:"S2",  region:"Posterior thigh",                    reflex:null,    myotome:"Knee flexion (hamstrings)",    disc:"S1/2" },
  { id:"n_s3",  level:"S3",  region:"Medial thigh / perineum",            reflex:null,    myotome:"Bowel/bladder sphincter",      disc:"—" },
  { id:"n_s4s5",level:"S4/5",region:"Perianal / saddle",                  reflex:"Anal wink", myotome:"Sphincter tone",           disc:"Cauda equina" },
];

// ── REFLEXES ──
const REFLEXES = [
  // ── Deep Tendon Reflexes (LMN indicators) ────────────────────────────────
  { id:"n_ref_jaw",     label:"Jaw Jerk",               level:"V (trigeminal)",  group:"DTR", technique:"Patient relaxed, mouth slightly open. Place finger on chin, tap with reflex hammer. Normal = minimal jaw closure. Brisk = pathological.", finding:"Brisk/exaggerated = UMN lesion ABOVE the pons (supranuclear). Normal or absent = brainstem/LMN. Urgency: CNS referral if brisk.", pathological:true, umnSign:true },
  { id:"n_ref_bicep",   label:"Biceps",                  level:"C5–C6",           group:"DTR", technique:"Elbow flexed to ~90°. Place thumb firmly on biceps tendon in antecubital fossa. Tap thumb with reflex hammer. Observe/feel for elbow flexion.", finding:"Diminished or absent = C5/C6 LMN (radiculopathy, peripheral nerve). Brisk/hyperactive = UMN (myelopathy, cord compression above C5). Asymmetry always significant.", pathological:false, umnSign:false },
  { id:"n_ref_brad",    label:"Brachioradialis",         level:"C5–C6",           group:"DTR", technique:"Forearm in neutral (semi-pronated), resting on thigh. Tap brachioradialis tendon 2–3cm proximal to radial styloid. Normal = forearm flexion + slight supination.", finding:"Absent = C5/6 radiculopathy. INVERTED reflex: BR absent + finger flexors contract = pathognomonic of cervical myelopathy at C5/6 — URGENT.", pathological:false, umnSign:false },
  { id:"n_ref_tricep",  label:"Triceps",                 level:"C6–C7",           group:"DTR", technique:"Support arm at 90° abduction or drape over forearm. Tap triceps tendon directly above olecranon. Observe elbow extension.", finding:"Diminished or absent = C7 radiculopathy (most common cause). Absent bilaterally = peripheral polyneuropathy or motor neuron disease. Brisk = UMN above C7.", pathological:false, umnSign:false },
  { id:"n_ref_patella", label:"Patella (Quadriceps)",    level:"L3–L4",           group:"DTR", technique:"Patient seated with legs hanging freely (or supine with knee supported at 20–30°). Tap patellar tendon briskly. Observe quadriceps contraction / knee extension.", finding:"Diminished = L3/4 disc herniation (most common). Absent = severe radiculopathy or femoral neuropathy. Brisk + Babinski = cord/UMN.", pathological:false, umnSign:false },
  { id:"n_ref_achilles",label:"Achilles (Plantar Flex)", level:"S1",              group:"DTR", technique:"Knee flexed, hip ER (patient kneeling or prone). Gently dorsiflex foot to tension tendon. Tap Achilles tendon. Observe plantarflexion jerk.", finding:"Diminished or absent = S1 radiculopathy (L5/S1 disc) OR peripheral neuropathy (diabetes, alcohol). Most sensitive indicator of S1 root. Absent bilaterally = peripheral polyneuropathy.", pathological:false, umnSign:false },
  { id:"n_ref_cremast", label:"Cremaster Reflex",        level:"L1–L2",           group:"DTR", technique:"Lightly stroke the superior medial thigh. Normal = ipsilateral testicular elevation (cremasteric muscle contraction).", finding:"Absent = L1/2 radiculopathy, femoral neuropathy, or cauda equina. Absent bilaterally with lower limb signs = UMN lesion or cauda equina syndrome — urgent.", pathological:false, umnSign:false },
  { id:"n_ref_plantar", label:"Plantar Reflex (Normal)", level:"S1–S2",           group:"DTR", technique:"Stroke lateral plantar surface heel-to-ball with blunt object (Babinski hammer or key). Normal adult response = toe plantarflexion (downgoing).", finding:"Normal adult = plantarflexion of toes (NEGATIVE/normal response). Upgoing = Babinski sign (see below — UMN). Absent response = possible LMN or dense sensory loss.", pathological:false, umnSign:false },

  // ── UMN Pathological Signs ────────────────────────────────────────────────
  { id:"n_ref_babinski",label:"Babinski Sign",           level:"UMN — Corticospinal Tract", group:"UMN", technique:"Patient supine and relaxed. Use blunt object (Babinski hammer handle, key). Stroke firmly from lateral heel along plantar surface curving medially to the ball of the foot. Observe great toe and other toes. POSITIVE = great toe extends (dorsiflexes) upward ± fanning of toes (Babinski response). NEGATIVE (normal adult) = toes plantarflex (curl down).", finding:"POSITIVE (ABNORMAL in adults): Extension of hallux ± toe fanning = corticospinal tract (UMN) lesion anywhere from motor cortex to S1 cord level. Causes: stroke, cord compression, myelopathy, MS, TBI, ALS. NEGATIVE: Normal in adults. Note: Normal in infants <12 months (tract unmyelinated).", pathological:true, umnSign:true },
  { id:"n_ref_chaddock",label:"Chaddock Sign",           level:"UMN — Alternative Babinski", group:"UMN", technique:"Stroke the lateral dorsum of the foot from the lateral malleolus toward the little toe. Alternative Babinski variant — useful when plantar skin is very calloused.", finding:"POSITIVE = upgoing great toe = same significance as Babinski. Use as confirmatory test when Babinski equivocal. Positive = UMN lesion.", pathological:true, umnSign:true },
  { id:"n_ref_oppenheim",label:"Oppenheim Sign",         level:"UMN — Babinski variant",    group:"UMN", technique:"Apply firm pressure with knuckles or thumb down the tibial crest (anterior shin), sliding distally from below the knee to the ankle.", finding:"POSITIVE = hallux extension (upgoing toe) = UMN lesion. Same clinical significance as Babinski. Use when Babinski is equivocal or patient refuses plantar stimulation.", pathological:true, umnSign:true },
  { id:"n_ref_hoffmann",label:"Hoffmann's Sign",         level:"UMN — Cervical Cord",       group:"UMN", technique:"Hold patient's middle finger loosely with forearm slightly pronated. Flick the distal phalanx DOWNWARD (releasing suddenly). Observe thumb and index finger. POSITIVE = thumb FLEXES and adducts involuntarily.", finding:"POSITIVE = upper motor neuron sign indicating corticospinal tract lesion at or above C8/T1. Suggests cervical myelopathy or cord compression. Always combined with clinical context — can be normal in hyperreflexic individuals. Bilateral positive = more significant. REFER for MRI cervical spine.", pathological:true, umnSign:true },
  { id:"n_ref_trommer", label:"Trömner's Sign",          level:"UMN — Cervical Cord",       group:"UMN", technique:"Hold middle finger from above. Flick the PALMAR surface of the middle finger's distal phalanx UPWARD (reverse of Hoffmann's). Observe thumb flexion.", finding:"POSITIVE = thumb and other finger flexion = UMN sign. Equivalent significance to Hoffmann's. Some clinicians find it more reliable. Bilateral positive = myelopathy suspected.", pathological:true, umnSign:true },

  // ── Clonus Tests ──────────────────────────────────────────────────────────
  { id:"n_ref_clonus_ankle", label:"Ankle Clonus",       level:"UMN — S1/S2 Cord",         group:"Clonus", technique:"Support knee in slight flexion. Cup the foot and apply sudden, sustained DORSIFLEXION pressure, maintaining force. Count rhythmic beats of plantarflexion–dorsiflexion oscillation. Time how long it sustains. POSITIVE = 3 or more sustained beats.", finding:"POSITIVE (>3 beats sustained) = UMN lesion. Mechanism: gamma motor neuron hyperactivity with loss of descending inhibition. Causes: cord compression, cervical/thoracic myelopathy, stroke, MS, cerebral palsy. 1–2 beats = equivocal (can be normal in anxious patients). Sustained (>10 beats) = severe UMN involvement — URGENT MRI + neurosurgical referral.", pathological:true, umnSign:true },
  { id:"n_ref_clonus_knee",  label:"Patellar Clonus",    level:"UMN — L3/L4",               group:"Clonus", technique:"Patient supine with leg extended. Grasp patella between thumb and index finger. Apply sudden, sustained DOWNWARD (distal) thrust. Maintain downward pressure and observe for rhythmic patellar oscillation.", finding:"POSITIVE = repeated patellofemoral oscillations = UMN lesion at or above L3/4. Less commonly used than ankle clonus but clinically significant. Indicates spasticity and loss of descending inhibition.", pathological:true, umnSign:true },
  { id:"n_ref_clonus_wrist", label:"Wrist Clonus",       level:"UMN — Cervical Cord",       group:"Clonus", technique:"Support forearm. Apply sudden sustained EXTENSION force to the wrist. Observe for rhythmic flexion–extension oscillation.", finding:"POSITIVE = wrist clonus = UMN sign suggesting cervical cord involvement. Combined with Hoffmann's and Babinski = very strong myelopathy pattern — urgent MRI cervical spine.", pathological:true, umnSign:true },

  // ── LMN Signs & Pattern Tests ─────────────────────────────────────────────
  { id:"n_ref_lmn_fascic",  label:"Fasciculations",      level:"LMN — Anterior Horn",       group:"LMN", technique:"Inspect muscle belly at rest for spontaneous, irregular, brief twitching. Use tangential lighting. May observe in tongue, limbs, trunk. Cannot be voluntarily controlled.", finding:"POSITIVE = visible fasciculations = lower motor neuron / anterior horn cell pathology. DDx: ALS/MND (urgent), benign fasciculation syndrome (common), electrolyte imbalance, medication. Combined with weakness and wasting = motor neuron disease pattern. REFER neurology.", pathological:true, umnSign:false },
  { id:"n_ref_lmn_wasting", label:"Muscle Wasting / Atrophy", level:"LMN — Denervation",   group:"LMN", technique:"Inspect and measure limb circumference bilaterally at standardised points (10cm above/below medial knee joint line; 15cm below acromion). >1cm asymmetry = significant.", finding:"POSITIVE = visible/measurable wasting = denervation (LMN) pattern. Causes: nerve root compression with chronic axonal loss, peripheral nerve injury, motor neuron disease. Combined with weakness in myotomal pattern = radiculopathy with axonal involvement. Note: atrophy also occurs with disuse — differentiate with EMG.", pathological:true, umnSign:false },
  { id:"n_ref_lmn_tone",    label:"Muscle Tone Assessment", level:"UMN / LMN differentiation", group:"LMN", technique:"Assess tone passively. For UMN: passive limb movement — catch/release pattern (clasp-knife spasticity) or lead-pipe rigidity. For LMN: passive movement feels flaccid, no resistance. Assess arms (flex/extend elbow, rotate wrist) and legs (roll leg, flex knee quickly).", finding:"SPASTIC (UMN): velocity-dependent resistance, clasp-knife release, associated hyperreflexia. RIGID (extrapyramidal): lead-pipe or cogwheel, not velocity-dependent, associated with Parkinsonism. FLACCID (LMN): reduced resistance, associated hyporeflexia and wasting — nerve root, peripheral nerve, or anterior horn. NORMAL: smooth with consistent low resistance.", pathological:false, umnSign:false },
  { id:"n_ref_pronator",   label:"Pronator Drift",        level:"UMN — Corticospinal",       group:"LMN", technique:"Patient stands with eyes CLOSED, arms outstretched in supination (palms up), held for 10–20 seconds. Observe for downward drift, pronation, or finger flexion of one arm.", finding:"POSITIVE = downward drift with pronation of one arm = contralateral corticospinal (UMN) lesion. Very sensitive early sign. Also seen in: early stroke, space-occupying lesion, TBI. Arm that drifts = ipsilateral hemisphere lesion (contralateral arm affected). If both drift with eyes open = cerebellar / proprioceptive issue.", pathological:true, umnSign:true },
];

// ── NEURAL_TENSION ──
const NEURAL_TENSION = [
  {
    id:"nt_slr", label:"Straight Leg Raise (SLR)",
    nerve:"L4–S1 (sciatic / lumbosacral roots)", sensitivity:"91%", specificity:"26%",
    procedure:"Patient supine. Lift leg with knee EXTENDED. Note angle of symptom onset. At positive angle, sensitise by adding cervical flexion + ankle DF.",
    positive:"Radicular pain/paraesthesia in distribution below knee between 30–70°. Above 70° = hamstring tightness.",
    differentiation:"Add ankle DF: worse = neural. Add cervical flex: worse = neuromeningeal. Remove DF at max angle: improves = neural tension.",
    pattern:"L4/5 disc: reproduces leg/foot symptoms. High specificity if crossed SLR positive.",
  },
  {
    id:"nt_slump", label:"Slump Test",
    nerve:"Entire neuraxis (spinal cord + nerve roots)", sensitivity:"84%", specificity:"83%",
    procedure:"Seated. Step 1: Slump trunk (thoracic kyphosis). Step 2: Flex neck. Step 3: Extend knee. Step 4: Add ankle DF. Positive = symptoms reproduced. Release neck extension.",
    positive:"Reproduction of symptoms relieved by neck extension = neural tension positive. More sensitive than SLR.",
    differentiation:"If symptoms increase with neck flex but reduce with neck extension = neural. If no change = hamstring tightness.",
    pattern:"Central sensitisation shows bilateral symptoms. Disc herniation = unilateral leg symptoms.",
  },
  {
    id:"nt_ultt1", label:"ULTT1 — Median Nerve",
    nerve:"Median nerve / C5–C7", sensitivity:"72%", specificity:"33%",
    procedure:"Shoulder depress → abduct 90° → ER → extend elbow → supinate forearm → extend wrist/fingers. Add cervical lateral flex (contralateral).",
    positive:"Paraesthesia in median nerve distribution (thumb/index/middle). Symptom change with cervical sensitisation.",
    differentiation:"Change symptoms by adding/removing ipsilateral vs contralateral cervical side flex.",
    pattern:"C5/6/7 radiculopathy. Thoracic outlet syndrome. Carpal tunnel (distal reproduction).",
  },
  {
    id:"nt_ultt2", label:"ULTT2 — Radial Nerve",
    nerve:"Radial nerve / C6–C8", sensitivity:"72%", specificity:"33%",
    procedure:"Shoulder depress + ER → abduct 90° → IR → extend elbow → pronate forearm → flex wrist.",
    positive:"Symptoms in posterior forearm / radial nerve distribution.",
    differentiation:"Pronate vs supinate forearm — radial nerve = worse with pronation.",
    pattern:"Tennis elbow, de Quervain's with radial nerve component. C6/7 radiculopathy.",
  },
  {
    id:"nt_ultt3", label:"ULTT3 — Ulnar Nerve",
    nerve:"Ulnar nerve / C8–T1", sensitivity:"69%", specificity:"N/A",
    procedure:"Shoulder depress + abduct → flex elbow → pronate forearm → extend wrist + fingers.",
    positive:"Paraesthesia in ring/little finger distribution. Medial elbow symptoms.",
    differentiation:"Adds cubital tunnel assessment. Positive with elbow flexion as sensitiser.",
    pattern:"Cubital tunnel syndrome. C8/T1 radiculopathy. TOS (lower trunk).",
  },
  {
    id:"nt_femoral", label:"Femoral Nerve Tension Test (FNTT)",
    nerve:"Femoral nerve / L2–L4", sensitivity:"88%", specificity:"N/A",
    procedure:"Patient prone. Flex knee to 90°. Therapist extends hip. Add cervical extension to sensitise. Positive = anterior thigh pain / L2–L4 distribution.",
    positive:"Anterior thigh and groin pain reproduced with hip extension + knee flexion.",
    differentiation:"Differentiate from hip pathology: add cervical extension — neural involvement increases symptoms.",
    pattern:"L2/3/4 disc herniation. Upper lumbar radiculopathy. Femoral neuropathy.",
  },
];

// ── RED_FLAGS_NEURO ──
const RED_FLAGS_NEURO = [
  { id:"nrf_cauda",     label:"Cauda Equina Syndrome",   severity:"EMERGENCY",   description:"Saddle anaesthesia (S3–S5), bilateral leg weakness, bowel/bladder incontinence or retention", action:"999 / Emergency Department NOW. MRI within 24h.", icon:"🆘" },
  { id:"nrf_myelopathy",label:"Cord Compression / Myelopathy", severity:"URGENT", description:"Positive Babinski, Hoffmann's, clonus, hyperreflexia + long tract signs, progressive spastic gait", action:"Urgent neurosurgical referral. No manipulation.", icon:"🔴" },
  { id:"nrf_prog_weak", label:"Progressive Neurological Weakness", severity:"URGENT", description:"Weakness deteriorating over days/weeks, widespread myotomal involvement, bilateral findings", action:"Urgent MRI + neurological referral within 48h.", icon:"🔴" },
  { id:"nrf_saddle",    label:"Saddle Anaesthesia",       severity:"EMERGENCY",   description:"Loss of sensation perineum, anus, inner thighs (S3–S5 distribution)", action:"Emergency Department immediately.", icon:"🆘" },
  { id:"nrf_umnsigns",  label:"Upper Motor Neuron Signs", severity:"URGENT",      description:"Babinski positive, hyperreflexia, spasticity, sustained clonus (>3 beats)", action:"Neurology referral. Cervical/thoracic MRI.", icon:"🔴" },
  { id:"nrf_bilateral", label:"Bilateral Neurological Signs", severity:"URGENT",  description:"Bilateral leg weakness, bilateral dermatomal loss, bilateral reflex changes", action:"Urgent referral — central disc, cord pathology.", icon:"🔴" },
  { id:"nrf_sphincter", label:"Sphincter Dysfunction",    severity:"EMERGENCY",   description:"New onset bowel/bladder dysfunction alongside back/leg pain", action:"Emergency admission.", icon:"🆘" },
];

// ── KEY_JOINTS ──
const KEY_JOINTS = { 0:"Nose",11:"L.Shoulder",12:"R.Shoulder",13:"L.Elbow",14:"R.Elbow",15:"L.Wrist",16:"R.Wrist",23:"L.Hip",24:"R.Hip",25:"L.Knee",26:"R.Knee",27:"L.Ankle",28:"R.Ankle",31:"L.Foot",32:"R.Foot" };

// ── TRACKING_STATES ──
const TRACKING_STATES = { IDLE:"idle", LOADING:"loading", CALIBRATING:"calibrating", DETECTING:"detecting", STABLE:"stable", LOST:"lost" };

// ── PC ──
const PC = {
  bg:"#faf8fc", surface:"#ffffff", s2:"#f5f0fb", s3:"#ede7f6",
  border:"#d8cce8", accent:"#7c3aed", a2:"#9333ea", a3:"#059669",
  text:"#1a1025", muted:"#7e6a9a", red:"#dc2626", yellow:"#b45309",
  green:"#059669", purple:"#9333ea", orange:"#f97316",
};

// ── mid ──
const mid = (a, b) => a && b ? { x:(a.x+b.x)/2, y:(a.y+b.y)/2, visibility: Math.min(a.visibility||0,b.visibility||0) } : null;

// ── vis ──
const vis = (lm, i, thresh=0.4) => (lm[i]?.visibility||0) > thresh;

// ── px ──
const px  = (lm, i, W, H) => lm[i] ? [lm[i].x*W, lm[i].y*H] : null;

// ── r1 ──
const r1 = v => v !== null && v !== undefined && !isNaN(v) ? Math.round(v*10)/10 : null;

// ── clamp ──
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

// ── POSTURE_VIEW_META ──
const POSTURE_VIEW_META = {
  anterior:  { label:"Anterior",      short:"Front",  colour:PC.accent,  icon:"⬆", analysisKey:"anterior", helper:"Patient faces camera, feet hip-width, arms relaxed. Camera at pelvis height.", checks:["Full body in frame","Camera at pelvis height","Feet hip-width apart","Minimal clothing","Patient relaxed"] },
  posterior: { label:"Posterior",     short:"Back",   colour:PC.a2,      icon:"⬇", analysisKey:"posterior",helper:"Patient faces away. Scapulae, gluteal crease and heels visible.", checks:["Hair off shoulders","Scapulae clearly visible","Equal weight both feet","Arms relaxed","Heel tendon visible"] },
  left:      { label:"Left Lateral",  short:"L.Side", colour:PC.yellow,  icon:"◀", analysisKey:"lateral",  helper:"Patient stands side-on, left side toward camera. EAM, acromion, GT, and lateral malleolus in frame.", checks:["Ear, shoulder, hip, ankle aligned","Neutral gaze","Knees not locked","Do not lean toward camera","Arms visible"] },
  right:     { label:"Right Lateral", short:"R.Side", colour:PC.green,   icon:"▶", analysisKey:"lateral",  helper:"Patient stands side-on, right side toward camera.", checks:["Ear, shoulder, hip, ankle aligned","Neutral gaze","Knees not locked","Do not lean away","Arms visible"] },
};

// ── POSTURE_MP_CDN ──
const POSTURE_MP_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404";



// ── POSTURE_DEFECTS ──
const POSTURE_DEFECTS = {
  forward_head: {
    id:"forward_head", icon:"🫀", label:"Forward Head Posture", region:"Cervical",
    view:["anterior","lateral"],
    description:"Ear positioned anterior to the acromion process. Each 2.5cm of forward translation adds ~10kg of effective cervical load.",
    tight_muscles:["Upper trapezius","SCM","Suboccipitals","Scalenes","Pec minor"],
    weak_muscles:["Deep neck flexors (DNF)","Lower trapezius","Serratus anterior","Rhomboids"],
    kinetic_chain:"Forward head → cervical lordosis → thoracic kyphosis → shoulder protraction → reduced lung capacity",
    exercises:["Chin tucks x15 3×","Wall angels x12 3×","DNF activation","Pec minor stretch"]
  },
  rounded_shoulders: {
    id:"rounded_shoulders", icon:"🔄", label:"Rounded/Protracted Shoulders", region:"Thoracic/Shoulder",
    view:["anterior","lateral","posterior"],
    description:"Anterior displacement of the humeral head with scapular protraction and internal rotation.",
    tight_muscles:["Pec major","Pec minor","Anterior deltoid","Subscapularis","Upper trapezius"],
    weak_muscles:["Lower trapezius","Serratus anterior","Rhomboids","Posterior rotator cuff"],
    kinetic_chain:"Protracted scapula → reduced subacromial space → impingement risk → compensatory cervical extension",
    exercises:["Band pull-apart x20","Face pulls x15","Pec doorway stretch","Scapular retraction holds"]
  },
  thoracic_kyphosis: {
    id:"thoracic_kyphosis", icon:"🪃", label:"Increased Thoracic Kyphosis", region:"Thoracic",
    view:["lateral","posterior"],
    description:"Excessive posterior convexity of the thoracic spine (>40° Cobb angle). May reduce respiratory capacity.",
    tight_muscles:["Pec major/minor","Anterior intercostals","Hip flexors"],
    weak_muscles:["Thoracic extensors","Lower trapezius","Gluteus maximus"],
    kinetic_chain:"Thoracic kyphosis → forward head → UCS → reduced hip extension → LCS compensations",
    exercises:["Thoracic extension over foam roller","T-spine rotation","Prone Y-T-W","Back extension"]
  },
  lumbar_hyperlordosis: {
    id:"lumbar_hyperlordosis", icon:"🌊", label:"Lumbar Hyperlordosis", region:"Lumbar",
    view:["lateral"],
    description:"Excessive anterior lumbar curve with anterior pelvic tilt. Increases facet joint loading.",
    tight_muscles:["Hip flexors (iliopsoas, rectus femoris)","TFL","Lumbar erectors","QL"],
    weak_muscles:["Gluteus maximus","Hamstrings","Transversus abdominis","Rectus abdominis"],
    kinetic_chain:"Anterior pelvic tilt → hip flexor tightness → glute inhibition → hamstring overload → posterior knee pain",
    exercises:["Hip flexor couch stretch","Glute bridges 3×15","Dead bug","TA activation"]
  },
  anterior_pelvic_tilt: {
    id:"anterior_pelvic_tilt", icon:"⬇", label:"Anterior Pelvic Tilt", region:"Lumbar/Pelvis",
    view:["lateral"],
    description:"ASIS positioned anterior and inferior to PSIS. Often co-exists with lumbar hyperlordosis.",
    tight_muscles:["Iliopsoas","Rectus femoris","TFL","Lumbar erectors"],
    weak_muscles:["Gluteus maximus","Hamstrings","TA","Internal obliques"],
    kinetic_chain:"APT → hip flexor tightness → glute inhibition → lumbar overload → disc stress at L4-S1",
    exercises:["Pelvic tilts","Couch stretch","Glute activation","Posterior pelvic tilt cues"]
  },
  posterior_pelvic_tilt: {
    id:"posterior_pelvic_tilt", icon:"⬆", label:"Posterior Pelvic Tilt", region:"Lumbar/Pelvis",
    view:["lateral"],
    description:"PSIS positioned inferior to ASIS. Flattens lumbar lordosis, often associated with prolonged sitting.",
    tight_muscles:["Hamstrings","Gluteus maximus","Rectus abdominis"],
    weak_muscles:["Hip flexors","Lumbar extensors","TFL"],
    kinetic_chain:"PPT → lumbar flexion bias → disc posterior loading → hamstring overuse",
    exercises:["Hip flexor stretching","Lumbar extension exercises","Prone hip extension","Cat-cow"]
  },
  lateral_pelvic_tilt: {
    id:"lateral_pelvic_tilt", icon:"↔", label:"Lateral Pelvic Tilt", region:"Lumbar/Pelvis",
    view:["anterior","posterior"],
    description:"Unilateral elevation of the iliac crest. May indicate leg length discrepancy or hip abductor weakness.",
    tight_muscles:["Ipsilateral QL","Ipsilateral TFL","Ipsilateral hip adductors"],
    weak_muscles:["Contralateral gluteus medius","Contralateral QL"],
    kinetic_chain:"Lateral pelvic tilt → scoliotic compensation → contralateral shoulder elevation → cervical lateral flexion",
    exercises:["Side-lying hip abduction","Clamshells","Standing hip abduction","QL stretch"]
  },
  genu_valgum: {
    id:"genu_valgum", icon:"🦵", label:"Genu Valgum (Knock Knees)", region:"Knee",
    view:["anterior","posterior"],
    description:"Medial deviation of the knee relative to the mechanical axis. Increases medial compartment and patellofemoral loading.",
    tight_muscles:["TFL","IT band","Hip adductors","Medial hamstrings"],
    weak_muscles:["Gluteus medius","Gluteus maximus","VMO","Hip external rotators"],
    kinetic_chain:"Genu valgum → hip IR → PFPS risk → medial ankle pronation → plantar fascia overload",
    exercises:["Clamshells","Monster walks","Single-leg squat with knee tracking","VMO terminal extensions"]
  },
  genu_varum: {
    id:"genu_varum", icon:"🦴", label:"Genu Varum (Bow Legs)", region:"Knee",
    view:["anterior","posterior"],
    description:"Lateral deviation of the knee. Increases lateral compartment loading and IT band tension.",
    tight_muscles:["IT band","Biceps femoris","Hip ER","Lateral gastrocnemius"],
    weak_muscles:["Hip adductors","VMO","Medial gastrocnemius"],
    kinetic_chain:"Genu varum → lateral knee overload → IT band syndrome → supinated foot posture",
    exercises:["IT band foam rolling","Hip adductor strengthening","Lateral step-downs","Arch support"]
  },
  foot_pronation: {
    id:"foot_pronation", icon:"🦶", label:"Foot Overpronation/Flat Arch", region:"Foot/Ankle",
    view:["anterior","posterior"],
    description:"Medial arch collapse with calcaneal eversion. The kinetic chain starting point for many lower limb issues.",
    tight_muscles:["Gastrocnemius","Soleus","Peroneals","Plantar fascia"],
    weak_muscles:["Tibialis posterior","FHL","Intrinsic foot muscles","Gluteus medius"],
    kinetic_chain:"Pronation → tibial IR → genu valgum → hip IR → PFPS → LCS compensations",
    exercises:["Short foot exercise","Calf raises","Tibialis posterior strengthening","Intrinsic foot doming"]
  },
  foot_supination: {
    id:"foot_supination", icon:"🔺", label:"Foot Supination/High Arch", region:"Foot/Ankle",
    view:["anterior","posterior"],
    description:"Elevated medial arch with reduced shock absorption. Associated with lateral ankle instability.",
    tight_muscles:["IT band","Peroneals","Plantar fascia","Gastroc lateral head"],
    weak_muscles:["Peroneals (with instability)","Intrinsic foot muscles"],
    kinetic_chain:"Supination → lateral ankle instability → lateral knee overload → genu varum compensation",
    exercises:["Peroneal strengthening","Single-leg balance","Lateral band walks","Arch mobilisation"]
  },
  scoliosis: {
    id:"scoliosis", icon:"〰", label:"Scoliosis / Lateral Spinal Curve", region:"Thoracic/Lumbar",
    view:["posterior"],
    description:"Lateral deviation of the spine with rotational component. Refer for Cobb angle measurement if suspected structural.",
    tight_muscles:["Ipsilateral concave paraspinals","Ipsilateral QL","Ipsilateral hip musculature"],
    weak_muscles:["Contralateral paraspinals","Convex-side core stabilisers"],
    kinetic_chain:"Scoliosis → rib cage rotation → shoulder height asymmetry → pelvic obliquity → leg length inequality",
    exercises:["Schroth breathing","Concave-side stretch","Convex-side strengthening","Pilates side-lying"]
  },
  head_tilt: {
    id:"head_tilt", icon:"↙", label:"Lateral Head Tilt", region:"Cervical",
    view:["anterior","posterior"],
    description:"Ipsilateral ear approaches ipsilateral shoulder. May indicate upper trap tightness or C-spine dysfunction.",
    tight_muscles:["Ipsilateral upper trapezius","Ipsilateral SCM","Ipsilateral scalenes","Ipsilateral levator scapulae"],
    weak_muscles:["Contralateral lateral neck flexors","Contralateral upper trapezius"],
    kinetic_chain:"Head tilt → cervical lateral flexion → ipsilateral shoulder elevation → compensatory thoracic curve",
    exercises:["Contralateral cervical lateral flexion stretch","Upper trap SMR","Levator scapulae stretch"]
  },
  scapular_winging: {
    id:"scapular_winging", icon:"🪶", label:"Scapular Winging", region:"Thoracic/Shoulder",
    view:["posterior"],
    description:"Medial border or inferior angle of scapula lifts from thoracic wall. Serratus anterior or trapezius dysfunction.",
    tight_muscles:["Pec minor","Pec major","Short head biceps"],
    weak_muscles:["Serratus anterior","Lower trapezius","Rhomboids"],
    kinetic_chain:"Scapular winging → reduced force couple → rotator cuff overload → impingement → biceps tendinopathy",
    exercises:["Serratus push-up plus","Wall slides","Lower trap Y raises","Scapular protraction resistance"]
  },
};

export { ALL_EXERCISES, ALL_TESTS, C, DASH_OPTS, DERMATOMES, ELBOW_PROTOCOLS, EXERCISE_DB, FABQ_OPTS, FMS_DB, FMS_STORAGE_KEY2, HIP_PROTOCOLS, KC_REGIONS, KEY_JOINTS, KNEE_PROTOCOLS, LEFS_OPTS, MOVEMENTS, NEURAL_TENSION, NKT_REGIONS, OM_CAT_COLOR, OUTCOME_DB, PC, POSTURE_DEFECTS, POSTURE_MP_CDN, POSTURE_VIEW_META, PROGRAMME_TEMPLATES, RED_FLAGS_NEURO, REFLEXES, RESTRICTION_GRADE, ROM_DATA, ROM_REDFLAGS, ROM_REGIONS, SHOULDER_PROTOCOLS, SUBJECTIVE_SECTIONS, TRACKING_STATES, TSK_OPTS, clamp, mid, px, r1, vis };
