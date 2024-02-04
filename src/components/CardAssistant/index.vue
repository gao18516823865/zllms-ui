<template>
  <div class="cardAssistant-wrap">
    <el-card class="wrap-card cardItem">
      <div class="wrap-card_content">
        <div class="wrap-card_header">
          <div class="wrap-card_header_name">
            <slot name="title" />
          </div>
          <div class="wrap-card_header_tag">
            <slot name="tag" />
          </div>
        </div>
        <div class="wrap-card_describe">
          <slot />
        </div>
      </div>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
.cardAssistant-wrap{
  .wrap-card{
    margin-right: 10px;
    margin-bottom: 10px;
    .wrap-card_content{
      .wrap-card_header{
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        justify-content: space-between;
        .wrap-card_header_name{
          font-size: 14px;
          font-weight: 500;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;
          white-space: nowrap;
          width: 120px;
        }
        .wrap-card_header_tag{
          display: flex;
          align-items: center;
        }
      }
      .wrap-card_describe{
        font-size: 14px;
        color: #8c939d;
        line-height: 20px;
        word-break: break-all;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }
  }
  .cardItem{
    height: 122px;
  }
}
</style>
