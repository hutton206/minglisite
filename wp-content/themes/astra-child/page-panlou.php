<?php
/**
 * Template Name: 七政四餘排盤
 */

if ( ! defined( 'ABSPATH' ) ) exit;

get_header();
?>
<style>
#content,#primary,#main,.ast-container,.entry-content,.ast-article-single,.site-content{
  max-width:none!important;width:100%!important;
  padding-left:0!important;padding-right:0!important;
  margin-left:0!important;margin-right:0!important;
}
.panlou-wrap{
  width:100vw!important;
  position:relative;
  left:50%;
  transform:translateX(-50%);
}
</style>

<div class="panlou-wrap">

  <div class="panlou-header">
    <h1>七政四餘排盤</h1>
    <div class="subtitle">回歸黃道 &middot; 整宮制 &middot; 真太陽時</div>
  </div>

  <div class="layout">

    <!-- 輸入表單 -->
    <div class="panel form-panel">
      <h2>出生資料</h2>
      <div class="fg"><label>出生日期</label><input type="date" id="bdate" value="1990-01-15"></div>
      <div class="fg"><label>出生時間（地方鐘錶時）</label><input type="time" id="btime" value="10:30"></div>
      <div class="fg">
        <label>時區（UTC 偏移）</label>
        <select id="tz">
          <option value="8">UTC+8（台灣／中國／港澳／新馬）</option>
          <option value="9">UTC+9（日本／韓國）</option>
          <option value="7">UTC+7（泰國／越南）</option>
          <option value="5.5">UTC+5:30（印度）</option>
          <option value="3">UTC+3（土耳其／沙烏地）</option>
          <option value="2">UTC+2（東歐／以色列）</option>
          <option value="1">UTC+1（西歐）</option>
          <option value="0">UTC+0（英國）</option>
          <option value="-3">UTC-3（巴西）</option>
          <option value="-5">UTC-5（美東）</option>
          <option value="-6">UTC-6（美中）</option>
          <option value="-7">UTC-7（美山）</option>
          <option value="-8">UTC-8（美西）</option>
        </select>
      </div>
      <div class="fg">
        <label>城市快選</label>
        <div class="cities">
          <span class="city" onclick="setCity(25.04,121.51,8)">台北</span>
          <span class="city" onclick="setCity(24.15,120.68,8)">台中</span>
          <span class="city" onclick="setCity(22.62,120.30,8)">高雄</span>
          <span class="city" onclick="setCity(23.00,120.21,8)">台南</span>
          <span class="city" onclick="setCity(22.31,114.17,8)">香港</span>
          <span class="city" onclick="setCity(31.23,121.47,8)">上海</span>
          <span class="city" onclick="setCity(39.90,116.39,8)">北京</span>
          <span class="city" onclick="setCity(22.54,114.06,8)">深圳</span>
          <span class="city" onclick="setCity(1.35,103.82,8)">新加坡</span>
          <span class="city" onclick="setCity(3.14,101.69,8)">吉隆坡</span>
          <span class="city" onclick="setCity(35.69,139.69,9)">東京</span>
          <span class="city" onclick="setCity(37.57,126.98,9)">首爾</span>
          <span class="city" onclick="setCity(48.85,2.35,1)">巴黎</span>
          <span class="city" onclick="setCity(51.51,-0.13,0)">倫敦</span>
          <span class="city" onclick="setCity(40.71,-74.01,-5)">紐約</span>
          <span class="city" onclick="setCity(34.05,-118.24,-8)">洛杉磯</span>
        </div>
      </div>
      <div class="row2">
        <div class="fg"><label>緯度 (N+/S-)</label><input type="number" id="lat" value="25.04" step="0.01" min="-89" max="89"></div>
        <div class="fg"><label>經度 (E+/W-)</label><input type="number" id="lon" value="121.51" step="0.01" min="-180" max="180"></div>
      </div>
      <button class="btn" onclick="calculate()">計 算 命 盤</button>
    </div>

    <!-- 星盤 SVG -->
    <div class="chart-panel">
      <svg id="chart-svg" viewBox="-35 -35 710 710">
        <text x="320" y="328" text-anchor="middle" fill="#252545" font-size="13">請輸入出生資料後點擊「計算命盤」</text>
      </svg>
      <div class="chart-info" id="chart-info"></div>
    </div>

    <!-- 星曆表 -->
    <div class="panel table-panel">
      <h2>星曆表</h2>
      <div id="planet-table"><div class="empty">尚未計算</div></div>
      <div class="house-info" id="house-info"></div>
    </div>

    <!-- 八字四柱 -->
    <div class="panel bazi-panel">
      <h2>八字四柱</h2>
      <div class="bazi-grid" id="bazi-grid">
        <div class="empty" style="grid-column:1/-1">尚未計算</div>
      </div>
      <div class="bazi-tst" id="bazi-tst"></div>
    </div>

  </div><!-- .layout -->

</div><!-- .panlou-wrap -->

<?php get_footer(); ?>
