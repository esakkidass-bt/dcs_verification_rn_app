import {AtLeastOne, OwnerDetailsOnlineProps} from '../../../@types';
import {executeSql} from '../../../helpers/sqlite';
import {SQLiteService} from '../../../services';
import {ITableNames} from '../tables/tableData';

interface QueryProps {
  districtCode?: string;
  talukCode?: string;
  villageCode?: string;
  pattaNumber?: string;
  surveyNumber?: string;
  subDivisionNumber?: string;
  ownerTypeId?: string;
  fields?: fieldsType[];
}

type fieldsType =
  | 'o.district_code'
  | 'o.taluk_code'
  | 'o.village_code'
  | 'o.patta_number'
  | 'o.survey_number'
  | 'o.sub_division_number'
  | 'o.extent'
  | 'o.land_type'
  | 'o.owner_name'
  | 'o.farmer_name'
  | 'o.owner_type_id'
  | 'o.id'
  | 'o.farmer_data_type'
  | 'omi.theervai';

type Props = {
  callback: (e: OwnerDetailsOnlineProps[]) => void;
} & AtLeastOne<QueryProps>;

const index = async (props: Props) => {
  const db = await new SQLiteService().getDb();
  const tableName: ITableNames = 'owner';
  let fields = 'o.*';
  if (props.fields) {
    fields = props.fields.join(',');
  }
  let query = `SELECT ${fields},
                      omi.theervai
               FROM ${tableName} AS o
                        LEFT JOIN ownerMiscInfo omi ON o.id = omi.owner_id
                        LEFT JOIN cropSurvey c
                                  ON o.district_code = c.districtCode
                                      AND o.taluk_code = c.talukCode
                                      AND o.village_code = c.villageCode
                                      AND o.survey_number = c.surveyNumber
                                      AND
                                     o.sub_division_number = c.subDivisionNumber
               WHERE c.id IS NULL
  `;

  console.log('>props.subDivisionNumber', props.subDivisionNumber, typeof props.subDivisionNumber)

  if (props.districtCode) {
    query += ` AND CAST(o.district_code AS TEXT) = '${props.districtCode}'`;
  }
  if (props.talukCode) {
    query += ` AND CAST(o.taluk_code AS TEXT) = '${props.talukCode}'`;
  }
  if (props.villageCode) {
    query += ` AND CAST(o.village_code AS TEXT) = '${props.villageCode}'`;
  }
  if (props.pattaNumber) {
    query += ` AND CAST(o.patta_number AS TEXT) = '${props.pattaNumber}'`;
  }
  if (props.surveyNumber) {
    query += ` AND CAST(o.survey_number AS TEXT) = '${props.surveyNumber}'`;
  }
  if (props.subDivisionNumber || props.subDivisionNumber === '') {
    query += ` AND CAST(o.sub_division_number AS TEXT) = '${props.subDivisionNumber}'`;
  }
  if (props.ownerTypeId) {
    query += ` AND CAST(o.owner_type_id AS TEXT) = '${props.ownerTypeId}'`;
  }

  db.transaction(async tx => {
    await executeSql(tx, `get data from ${tableName}`, query, {
      debug: true,
      logSql: true,
      callback: e => {
        const items = [];
        const len = e.rows.length;
        for (let i = 0; i < len; i++) {
          items.push(e.rows.item(i));
        }
        props.callback(items);
      },
    });
  });
};

export default index;
