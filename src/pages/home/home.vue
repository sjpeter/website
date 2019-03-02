<template>
  <el-container>
    <el-header>
      <div class="header-out">
        <div class="header-in">ss</div>
      </div>
    </el-header>
    <el-main>Main</el-main>
    <el-footer>Footer</el-footer>
  </el-container>
</template>
<script type="text/javascript"></script>
<style type="text/css">
  .header-out{
    height: 30%;
    width: 60%;
    border-width: 6px;
    border-style: hidden double hidden double;
    margin: auto;
  }
  .header-in{
    width: 99%;
    height: 90%;
    border-width: 6px;
    border-style: double hidden double hidden;
    margin: auto;
  }
  .el-container{
    height: 100%;
    width: 100%;
    background: radial-gradient(#29abe2,#004385);
  }
  .el-header, .el-footer {
    height: 20%!important;
    width: 100%;
    color: #333;
    text-align: center;
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    height: 60%;
  }
</style>
