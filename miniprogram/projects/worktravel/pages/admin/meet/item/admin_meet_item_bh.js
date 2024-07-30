const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const dataHelper = require('../../../../../../helper/data_helper.js');
const helper = require('../../../../../../helper/helper.js');
const AdminMeetBiz = require('../../../../biz/admin_meet_biz.js');
const validate = require('../../../../../../helper/validate.js');

module.exports = Behavior({
	/**
	 * 页面的初始数据
	 */
	data: {

		oprt: 'admin',
		formItemList: []
	},

	methods: {

		_init: function () {

			let parent = pageHelper.getPrevPage(2);
			if (parent) {
				let formItemList = dataHelper.deepClone(parent.data.formItemList);

				this.setData({
					formItemList
				});

			}
		},


		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function () {

		},

		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: function () { },

		/**
		 * 生命周期函数--监听页面隐藏
		 */
		onHide: function () {

		},

		/**
		 * 生命周期函数--监听页面卸载
		 */
		onUnload: function () { },

		model: function (e) {
			pageHelper.model(this, e);
		},

		onPageScroll: function (e) {
			if (e.scrollTop > 100) {
				this.setData({
					topShow: true
				});
			} else {
				this.setData({
					topShow: false
				});
			}
		},


		bindTopTap: function () {
			wx.pageScrollTo({
				scrollTop: 0
			})
		},

		bindItemBlur: function (e) {
			let idx = pageHelper.dataset(e, 'idx');
			let name = pageHelper.dataset(e, 'name');
			let val = e.detail.value.trim();
			let formItemList = this.data.formItemList;
			formItemList[idx][name] = val;

		},
		bindDelItemTap: function (e) {
			let formItemList = this.data.formItemList;


			let callback = () => {
				let idx = pageHelper.dataset(e, 'idx');
				formItemList.splice(idx, 1);
				this.setData({
					formItemList
				});
			}

			pageHelper.showConfirm('确定删除该套餐吗？', callback);
		},

		url: function (e) {
			pageHelper.url(e, this);
		},

		bindAddItemTap: function (e) {
			let formItemList = this.data.formItemList;
			if (formItemList.length >= 10) return pageHelper.showModal('最多可以添加10个');

			let item = dataHelper.deepClone(AdminMeetBiz.ITEM_BASE);
			formItemList.push(item);
			this.setData({
				formItemList
			});
		},

		bindSaveTap: function () {
			// 清除焦点
			let formItemList = this.data.formItemList;
			for (let k = 0; k < formItemList.length; k++) {
				if (helper.isDefined(formItemList[k].focus)) delete formItemList[k].focus;
			}
			this.setData({
				formItemList
			});


			for (let k = 0; k < formItemList.length; k++) {
				if (formItemList[k].name.length <= 0
					|| formItemList[k].price.length <= 0
					|| formItemList[k].desc.length <= 0
				) {
					let mark = '';
					if (formItemList[k].name.length <= 0) mark = '套餐名称';
					else if (formItemList[k].price.length <= 0) mark = '价格';
					else if (formItemList[k].desc.length <= 0) mark = '套餐内容说明';


					formItemList[k].focus = '第' + (Number(k) + 1) + '个套餐「' + mark + '」不能为空';
					this.setData({ formItemList });
					pageHelper.anchor('item_' + k, this);
					return pageHelper.showModal('第' + (Number(k) + 1) + '个套餐「' + mark + '」不能为空');
				}

				let ret = validate.checkMoney(formItemList[k].price, '价格');
				if (ret) {
					formItemList[k].focus = '第' + (Number(k) + 1) + '个套餐 ' + ret;
					this.setData({ formItemList });
					pageHelper.anchor('item_' + k, this);
					return pageHelper.showModal('第' + (Number(k) + 1) + '个套餐 ' + ret);
				}

				formItemList[k].price = Number(formItemList[k].price);

			}

			let parent = pageHelper.getPrevPage(2);
			if (!parent) {
				pageHelper.showNoneToast('前序页面不存在');
				return;
			}


			parent.setData({
				formItemList
			});

			wx.navigateBack();
		}
	}
})