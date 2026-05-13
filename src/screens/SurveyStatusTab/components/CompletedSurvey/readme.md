[
  '{{repeat(5, 7)}}',
  {
      _id: '{{objectId()}}',
    farmerName: '{{firstName()}} {{surname()}}',
    index: '{{index()}}',
    surveyNo: '{{integer(1, 9)}}/{{integer(1, 9)}}',
    patta: '{{integer(1000, 9999)}}',
    type: '{{random("Owner", "Tenant")}}',
    status: '{{random("completed", "pending")}}',
    area:'{{integer(10, 40)}}',
    cropName:'{{random("Rice", "Wheat", "Corn", "Sugar cane")}}',
    stage:'{{random("1", "2")}}',
    surveyDate: '{{date(new Date(2023, 0, 1), new Date(), "dd/MM/YYYY")}}'
  }
]
## https://json-generator.com/