<template>
  <div id="app">
    <b-container fluid>
      <b-row>
        <b-col cols="12" col sm="12" md="4" lg="3" class="p-5">
          <b-row>
            <b-col>
              <b-img :src="require('./assets/taipeilogo.png')" fluid></b-img>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="p-2">109年人口戶數及性別</div>
            </b-col>
          </b-row>
        </b-col>
        <b-col id="main" cols="12" col sm="12" md="8" lg="9" class="p-5">
          <b-overlay :show="show">
            <b-container class="py-5">
              <b-row>
                <b-col cols="3" col sm="5" md="3" class="pt-3"><b>地區</b></b-col>
                <b-col cols="7" col sm="5" md="7" class="m-2">
                  <b-form-select v-model="ddl_area" :options="area_options" @change="changeArea"></b-form-select>
                </b-col>
              </b-row>
              <b-row class="py-5">
                <b-col>
                  <div id="myChart"></div>
                </b-col>
              </b-row>
            </b-container>
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
let echarts = require('echarts/lib/echarts')
// 引入折線圖等組件
require('echarts/lib/chart/bar')
require('echarts/lib/component/tooltip');
require('echarts/lib/component/legend');
import api from 'axios'
import jslinq from 'jslinq'

export default {
  name: 'App',
  data() {
    return {
      show: true,
      datalist: [],
      area_options: [
        { value: null, text: '請選擇' },
        { value: '松山區', text: '松山區'},
        { value: '信義區', text: '信義區'},
        { value: '大安區', text: '大安區'},
        { value: '中山區', text: '中山區'},
        { value: '中正區', text: '中正區'},
        { value: '大同區', text: '大同區'},
        { value: '萬華區', text: '萬華區'},
        { value: '文山區', text: '文山區'},
        { value: '南港區', text: '南港區'},
        { value: '內湖區', text: '內湖區'},
        { value: '士林區', text: '士林區'},
        { value: '北投區', text: '北投區'}
      ],
      ddl_area: null
    }
  },
  created() {
    window.addEventListener("resize", () => {
      this.changeArea()
    })
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      const url = 'https://www.ris.gov.tw/rs-opendata/api/v1/datastore/ODRP019/109'

      api.get(url).then(response => {
        if (response.status == 200) {
          const tlist = response.data.responseData
          this.organizeData(tlist)
        } else {
          alert('讀取資料不正確')
        }
        this.show = false
      }).catch(err => {
        console.log(err)
        alert('取得資料不正確')
        this.show = false
      })
    },
    organizeData(data) {
      /*
      site_id: 區域別
      household_ordinary_m : 共同生活戶_男
      household_single_m: 單獨生活戶_男
      household_ordinary_f: 共同生活戶_女
      household_single_f: 單獨生活戶_女
      */
      const queryObj = jslinq(data)
      let temp = queryObj.where(el => {
        if (el.site_id.includes('臺北市'))
        return el
      }).groupBy(el => {
        return el.site_id
      }).toList()
      temp.forEach(item => {
        const tempObj = jslinq(item.elements)
        let sum_ordinary_m = tempObj.select(el => { return el.household_ordinary_m }).sum(el => { return parseInt(el)})
        let sum_single_m = tempObj.select(el => { return el.household_single_m }).sum(el => { return parseInt(el)})
        let sum_ordinary_f = tempObj.select(el => { return el.household_ordinary_f }).sum(el => { return parseInt(el)})
        let sum_single_f = tempObj.select(el => { return el.household_single_f }).sum(el => { return parseInt(el)})
        this.datalist.push({
          "site_id": item.key,
          "household_m": [sum_ordinary_m,sum_single_m],
          "household_f": [sum_ordinary_f,sum_single_f]
        })
      })
    },
    drawLine(dataObj) {
      let option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          show: true,
          bottom: 10,
          data: ['男', '女']
        },
        grid: {
          left: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: { 
          type: 'category',
          axisTick: {
            show: false
          },
          data: dataObj.name
        },
        yAxis: {},
        series: [
          {
            name: '男',
            type: 'bar',
            color: '#5e7d9c',
            data: dataObj.household_m
          },
          {
            name: '女',
            type: 'bar',
            color: '#f36094',
            data: dataObj.household_f
          }
        ]
      };
      document.getElementById('myChart').setAttribute("style","height:70vh;width:100%");
      let myCharts = echarts.init(document.getElementById('myChart'))
      myCharts.setOption(option)
      myCharts.resize()
    },
    changeArea() {
      if (this.ddl_area != '') {
        const queryObj = jslinq(this.datalist)
        let data = queryObj.where(el => {
          if (el.site_id.includes(this.ddl_area)) {
            return el
          }
        }).toList()
        this.drawLine({ "name": ['共同生活戶', '單獨生活戶'],"household_m": data[0].household_m, "household_f": data[0].household_f})
      } 
    },
  }
}


</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: auto;
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  margin: 0 auto;
}

#main {
  background-color: #e9e9e9;
  height: 100vh;
}
</style>
