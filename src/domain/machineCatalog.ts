import type { BrandId } from './types'

export interface MachineModel {
  name: string
  aliases?: string[]
  imageUrl: string | null
}

const TECHNOGYM_IMAGES = 'https://webapi-prod.technogym.com/dw/image/v2/BFLQ_PRD/on/demandware.static/-/Sites-tg-catalog-master/default'
const HAMMER_IMAGES = 'https://www.lifefitness.com/Kentico13CoreBase/media/LFMedia/LifeFitnessImages'
const IMAGE_WIDTH = 800

function technogym(path: string): string {
  return `${TECHNOGYM_IMAGES}/${path}?sw=${IMAGE_WIDTH}`
}

function hammer(path: string): string {
  return `${HAMMER_IMAGES}/${path}?width=${IMAGE_WIDTH}`
}

export const MACHINE_CATALOG: Record<BrandId, MachineModel[]> = {
  technogym: [
    { name: 'Chest Press', imageUrl: technogym('dw60680dfa/product/MNFP/packshot_1_1_white.jpg') },
    { name: 'Pectoral', imageUrl: technogym('dw3e7efeb3/product/MNTP/packshot_1_1_white.jpg') },
    { name: 'Shoulder Press', imageUrl: technogym('dw274b9480/product/MNEP/packshot_1_1_white.jpg') },
    { name: 'Lat Machine', imageUrl: technogym('dwcf94e043/product/MNLP/packshot_1_1_white.jpg') },
    { name: 'Vertical Traction', imageUrl: technogym('dw6614b30e/product/MNGP/packshot_1_1_white.jpg') },
    { name: 'Low Row', imageUrl: technogym('dw24f41f61/product/MNHP/packshot_1_1_white.jpg') },
    { name: 'Upper Back', imageUrl: technogym('dwd774cb2b/product/MN1P/packshot_1_1_white.jpg') },
    { name: 'Delts Machine', imageUrl: technogym('dwaf2d7a0f/product/MNKP/packshot_1_1_white.jpg') },
    { name: 'Arm Curl', imageUrl: technogym('dwba6345f5/product/MNRP/packshot_1_1_white.jpg') },
    { name: 'Arm Extension', imageUrl: technogym('dweebc531e/product/MNSP/packshot_1_1_white.jpg') },
    { name: 'Leg Press', imageUrl: technogym('dw1af8e0cc/product/MNAP/selection_900_leg_press_related.jpg') },
    { name: 'Leg Extension', imageUrl: technogym('dw8606f128/product/MNJP/packshot_1_1_white.jpg') },
    { name: 'Leg Curl', imageUrl: technogym('dwdb6d95e7/product/MNIP/selection_900_leg_curl_related.jpg') },
    { name: 'Prone Leg Curl', imageUrl: technogym('dw4f66349c/product/MNUP/selection_pro_prone_leg_curl_related_2.jpg') },
    { name: 'Abductor', imageUrl: technogym('dw08351664/product/MNPP/packshot_1_1_white.jpg') },
    { name: 'Adductor', imageUrl: technogym('dwdf3efaa2/product/MNQP/packshot_1_1_white.jpg') },
    { name: 'Glute Press', aliases: ['Glute'], imageUrl: technogym('dwaebfc338/product/MN4P/selection-900-glute-press-MN4-white.jpg') },
    { name: 'Multi Hip', imageUrl: technogym('dw182c967b/product/MNDP/packshot_1_1_white.jpg') },
    { name: 'Abdominal Crunch', imageUrl: technogym('dw07ffaf20/product/MNBP/packshot_1_1_white.jpg') },
    { name: 'Lower Back', imageUrl: technogym('dw74006888/product/MNCP/packshot_1_1_white.jpg') },
    { name: 'Rotary Torso', imageUrl: technogym('dw37328572/product/MNYP/packshot_1_1_white.jpg') },
    { name: 'Cable Station', imageUrl: technogym('dw8a1f7abb/product/MQ0D/MQ0D_packshot.jpg') },
    { name: 'Run (tapis)', imageUrl: technogym('dw0d0264ce/product/DFK-DGE/DFKDAQ5A0BA0AAX1/DFKDAQ5A0BA0AAX1-packshot01.jpg') },
    { name: 'Bike', imageUrl: technogym('dwbab0c26b/product/DFC-DGE/excite+-bike-packshot.jpg') },
    { name: 'Recline', imageUrl: technogym('dwe3a20493/product/DFD-DGE/DFDD3Q3A0BAAAAX0-gallery01.jpg') },
    { name: 'Synchro (elliptique)', imageUrl: technogym('dwa2fe804f/product/DFH-DGE/excite+-synchro-hero.jpg') },
    { name: 'Climb', imageUrl: technogym('dw7b59a723/product/DFE-DGE/DFED3Q3T0BA0AAX0-gallery01.jpg') },
    { name: 'Skillrow', imageUrl: technogym('dwb0043152/product/DJR0NDT/packshot_1_1_white.jpg') },
  ],
  'hammer-strength': [
    {
      name: 'Iso-Lateral Bench Press',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Bench%20Press/Strength-PlateLoaded-IsoLateral-BenchPress-9.png'),
    },
    {
      name: 'Iso-Lateral Incline Press',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Iso%20Lateral%20Incline%20Press/Strength-PlateLoaded-IsoLateralInclinePress-8.png'),
    },
    {
      name: 'Iso-Lateral Decline Chest Press',
      aliases: ['Iso-Lateral Decline Press'],
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Decline%20Chest%20Press/Strength-PlateLoaded-DeclineChestPress-1.png'),
    },
    {
      name: 'Iso-Lateral Wide Chest',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Wide%20Chest/Strength-PlateLoaded-IsoLateral-WideChest-Thumbnail-1.png'),
    },
    {
      name: 'Iso-Lateral Shoulder Press',
      imageUrl: hammer(
        'Equipment/Strength/Plate-Loaded/Iso-Lateral%20Shoulder%20Press/Strength-PlateLoaded-IsoLateralShoulderPress-Render-2.png',
      ),
    },
    {
      name: 'Iso-Lateral Front Lat Pulldown',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Font%20Lat%20Pulldown/Strength-PlateLoaded-IsoLateral-FrontLatPulldown-7.png'),
    },
    {
      name: 'Iso-Lateral Row',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Iso-Lateral%20Row/Strength-PlateLoaded-IsoLateral-Row-Thumbnail-1.png'),
    },
    {
      name: 'Iso-Lateral High Row',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/High%20Row/Strength-PlateLoaded-IsoLateral-HighRow-7.png'),
    },
    {
      name: 'Iso-Lateral Low Row',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Iso-Lateral%20Low%20Row/Strength-PlateLoaded-IsoLateralLowRow-8.png'),
    },
    {
      name: 'Iso-Lateral Leg Press',
      imageUrl: hammer('MediaSync/397-33-hs-plate-loaded-iso-lateral-leg-press-l.png'),
    },
    {
      name: 'Iso-Lateral Leg Extension',
      imageUrl: hammer(
        'Equipment/Strength/Plate-Loaded/Iso-Lateral%20Leg%20Extension/Strength-PlateLoaded-IsoLateralLegExtension-8.PNG',
      ),
    },
    {
      name: 'Iso-Lateral Kneeling Leg Curl',
      imageUrl: hammer(
        'Equipment/Strength/Plate-Loaded/Kneeling%20Leg%20Curl/Strength-PlateLoaded-IsoLateral-KneelingLegCurl-Thumbnail-1.png',
      ),
    },
    {
      name: 'Linear Leg Press',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Linear%20Leg%20Press/Strength-PlateLoaded-LinearLegPress-Thumbnail-1.png'),
    },
    {
      name: 'Hack Squat',
      aliases: ['Linear Hack Press'],
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Hack%20Squat/LF-Hack-Squat-Render.png'),
    },
    {
      name: 'V-Squat',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/V-Squat/Strength-PlateLoaded-VSquat-8.png'),
    },
    {
      name: 'Belt Squat',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Belt%20Squat/Strength-PlateLoaded-BeltSquat-7.png'),
    },
    {
      name: 'Seated Calf Raise',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Seated%20Calf%20Raise/Strength-PlateLoaded-SeatedCalfRaise-8.png'),
    },
    {
      name: 'Select Standing Calf',
      aliases: ['Standing Calf Raise'],
      imageUrl: hammer('MediaSync/28-173-hammer-strength-select-standing-calf-image-new.jpg'),
    },
    {
      name: 'Glute Drive',
      aliases: ['Hip Thrust'],
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Glute%20Drive/Strength-PlateLoaded-GluteDrive-8.png'),
    },
    {
      name: 'Ground Base Squat Lunge',
      imageUrl: hammer('MediaSync/326-442-hs-plate-loaded-ground-base-squat-lunge-l.png'),
    },
    {
      name: 'Seated Biceps',
      aliases: ['Biceps Curl'],
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Seated%20Biceps/Strength-PlateLoaded-SeatedBiceps-Thumbnail-1.png'),
    },
    {
      name: 'Seated Dip',
      imageUrl: hammer('Equipment/Strength/Plate-Loaded/Seated%20Dip/Strength-PlateLoaded-SeatedDip-Thumbnail-1.png'),
    },
  ],
  'free-weights': [
    { name: 'Barre olympique', imageUrl: null },
    { name: 'Haltères', imageUrl: null },
    { name: 'Kettlebell', imageUrl: null },
    { name: 'Smith machine', imageUrl: null },
    { name: 'Banc', imageUrl: null },
    { name: 'Barre de traction', imageUrl: null },
    { name: 'Poids du corps', imageUrl: null },
  ],
  other: [],
}
