export const croppingMethod = {
  MONO: '1',
  INTER: '2',
  MIXED: '3',
  MULTI: '4',
};

// export const AGRICULTURE_NO_USE: any[] = ["6", "7"];

export const AGRICULTURE_NO_USE_IDS: any[] = ['6', '7'];
export const TREE_OR_BORDER_CROP: any[] = ['4'];
export const cropSeasonType = {
  ANNUAL: '1',
  SEASONAL: '2',
  PERENNIAL: '3',
  TREE: '4',
};

export const cropSeasonPeriodBySeasonType = {
  [cropSeasonType.ANNUAL]: 2,

  [cropSeasonType.SEASONAL]: 2,

  [cropSeasonType.PERENNIAL]: 50,
  [cropSeasonType.TREE]: 50,
};
export const cropSeasonPeriodInMonthsBySeasonType = {
  [cropSeasonType.ANNUAL]: 8,

  [cropSeasonType.SEASONAL]: 6,

  [cropSeasonType.PERENNIAL]: 600,
  [cropSeasonType.TREE]: 600,
};

export const cultiVatorTypes = [
  {
    label: 'Owner',
    value: '1',
  },
  {
    label: 'Cultivator',
    value: '2',
  },
  {
    label: 'Legal Heir',
    value: '3',
  },
];
