
(function () {

    // 存储翻页的所有数据
    function TurnPage(options, wrap) {
        this.nowPage = options.nowPage || 1;
        this.allPage = options.allPage || 1;
        this.changePage = options.changePage || function () {};
        this.wrap = wrap || $('body');
    }

    TurnPage.prototype.init = function () {
        this.fillHTML();
        this.bindEvent()
    }
    TurnPage.prototype.fillHTML = function () {
        var pageContainer = $('<ul class="my-page-wrapper"></ul>');
        // 添加上一页按钮
        if (this.nowPage > 1) {
            $('<li class="my-page-prev">上一页</li>').appendTo(pageContainer);
        }
        $('<li class="my-page-num">1</li>').appendTo(pageContainer)
                                            .addClass(1 == this.nowPage ? 'my-page-cur' : '');
        // 添加前面的省略号
        if (this.nowPage - 2 > 2) {
            $('<span>...</span>').appendTo(pageContainer);
        }
        // 添加中间五页
        for (var i = this.nowPage - 2; i <= this.nowPage + 2; i ++) {
            if (i > 1 && i < this.allPage) {
                $('<li class="my-page-num"></li>').text(i)
                                                  .addClass(i == this.nowPage ? 'my-page-cur' : '')
                                                  .appendTo(pageContainer);
            }
        }
        // 添加后面的省略号
        if (this.nowPage + 2 < this.allPage - 1) {
            $('<span>...</span>').appendTo(pageContainer);
        }
        // 添加最后一页
        this.allPage != 1 && $('<li class="my-page-num"></li>').text(this.allPage)
                                          .addClass(this.allPage == this.nowPage ? 'my-page-cur' : '')
                                          .appendTo(pageContainer);
        // 添加下一页按钮
        if (this.nowPage  < this.allPage) {
            $('<li class="my-page-next">下一页</li>').appendTo(pageContainer);
        }

        $(this.wrap).empty().append(pageContainer)
    }

    TurnPage.prototype.bindEvent = function () {
        var self = this;
        $('.my-page-prev', this.wrap).click(function () {
            self.nowPage --;
            self.init();
            self.changePage(self.nowPage);
        });
        $('.my-page-next', this.wrap).click(function () {
            self.nowPage ++;
            self.init();
            self.changePage(self.nowPage);
        });
        $('.my-page-num', this.wrap).click(function () {
           self.nowPage = parseInt($(this).text());
           self.init();
           self.changePage(self.nowPage);
        })
    }
    $.fn.extend({
        page: function (options) {
            var page = new TurnPage(options, this);
            page.init();
        }
    })
} ())