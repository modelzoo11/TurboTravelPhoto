/**
 * Notes: 预约模块后台管理-控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-08 10:20:00 
 */

const BaseProjectAdminController = require('./base_project_admin_controller.js');
const AdminMeetService = require('../../service/admin/admin_meet_service.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const MeetModel = require('../../model/meet_model.js');
const contentCheck = require('../../../../framework/validate/content_check.js');

class AdminMeetController extends BaseProjectAdminController {

	// 计算可约天数
	_getLeaveDay(days) {
		let now = timeUtil.time('Y-M-D');
		let count = 0;
		for (let k = 0; k < days.length; k++) {
			if (days[k] >= now) count++;
		}
		return count;
	}

	async getDayList() {
		await this.isAdmin();

		let rules = {
			meetId: 'must|id',
			start: 'must|date',
			end: 'must|date',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		return await service.getDayList(input.meetId, input.start, input.end);
	}



	/** 管理员按钮核销 */
	async checkinJoin() {
		await this.isAdmin();

		let rules = {
			joinId: 'must|id',
			flag: 'must|in:0,1'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		await service.checkinJoin(input.joinId, input.flag);
	}

	/** 管理员扫码核验 */
	async scanJoin() {
		await this.isAdmin();

		let rules = {
			meetId: 'must|id',
			code: 'must|string|len:15',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		await service.scanJoin(input.meetId, input.code);
	}

	/** 预约排序 */
	async sortMeet() { // 数据校验
		await this.isAdmin();

		let rules = {
			meetId: 'must|id',
			sort: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		await service.sortMeet(input.meetId, input.sort);
	}

	/** 首页设定 */
	async vouchMeet() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			vouch: 'must|int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		await service.vouchMeet(input.id, input.vouch);
	}

	/** 预约状态修改 */
	async statusMeet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			meetId: 'must|id',
			status: 'must|int|in:0,1,9,10',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await MeetModel.getOneField(input.meetId, 'MEET_TITLE');

		let service = new AdminMeetService();
		await service.statusMeet(input.meetId, input.status);

		if (title)
			this.logOther('修改了《' + title + '》的状态为：' + MeetModel.getDesc('STATUS', input.status));
	}


	/** 取消报名 */
	async cancelJoin() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			joinId: 'must|id',
			reason: 'string|max:200',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		return await service.cancelJoin(input.joinId, input.reason);
	}

	/** 预约项目列表 */
	async getAdminMeetList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			whereEx: 'object|name=附加查询条件',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		let result = await service.getAdminMeetList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {

			list[k].MEET_ADD_TIME = timeUtil.timestamp2Time(list[k].MEET_ADD_TIME);
			list[k].MEET_EDIT_TIME = timeUtil.timestamp2Time(list[k].MEET_EDIT_TIME);
			list[k].leaveDay = this._getLeaveDay(list[k].MEET_DAYS);
 
			list[k].MEET_PAY_FEE = Number(dataUtil.fmtMoney(list[k].MEET_PAY_FEE / 100));

		}
		result.list = list;

		return result;

	}

	/** 预约名单列表 */
	async getJoinList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			meetId: 'must|id',
			mark: 'must|string',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		let result = await service.getJoinList(input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].JOIN_ADD_TIME);
			list[k].JOIN_CHECKIN_TIME = timeUtil.timestamp2Time(list[k].JOIN_CHECKIN_TIME);

			list[k].JOIN_CANCEL_TIME = timeUtil.timestamp2Time(list[k].JOIN_CANCEL_TIME);

			list[k].JOIN_PAY_FEE = Number(dataUtil.fmtMoney(list[k].JOIN_PAY_FEE / 100));
			list[k].JOIN_PAY_TIME = timeUtil.timestamp2Time(list[k].JOIN_PAY_TIME);
 

		}
		result.list = list;

		return result;

	}

	/** 发布 */
	async insertMeet() {
		await this.isAdmin();

		let rules = {
		 
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminMeetService();
		let result = await service.insertMeet(this._adminId, input);


		this.logOther('创建了新《' + input.title + '》');

		return result;

	}



	async setDays() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			daysSet: 'must|array|name=预约时间设置',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminMeetService();
		let result = await service.setDays(input.id, input);

		return result;

	}


	/** 获取预约信息用于编辑修改 */
	async getMeetDetail() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		let detail = await service.getMeetDetail(input.id);

		if (detail) { 

			let itemList = detail.MEET_ITEM_LIST;
			for (let n = 0; n < itemList.length; n++) {
				itemList[n].price = Number(dataUtil.fmtMoney(itemList[n].price / 100));
			}
		}

		return detail;
	}

	/** 编辑预约 */
	async editMeet() {
		await this.isAdmin();

		let rules = {
			 
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminMeetService();
		let result = service.editMeet(input);


		this.logOther('修改了《' + input.title + '》');

		return result;
	}


	/** 更新图片信息 */
	async updateMeetForms() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
			hasImageForms: 'array'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiAdmin(input);

		let service = new AdminMeetService();
		return await service.updateMeetForms(input);
	}


	/** 删除预约 */
	async delMeet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			meetId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let title = await MeetModel.getOneField(input.meetId, 'MEET_TITLE');

		let service = new AdminMeetService();
		await service.delMeet(input.meetId);


		if (title)
			this.logOther('删除了《' + title + '》');
	}


	/** 创建模板 */
	async insertMeetTemp() {
		await this.isAdmin();

		let rules = {
			name: 'must|string|min:1|max:20|name=名称',
			times: 'must|array|name=模板时段',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		let result = await service.insertMeetTemp(input);

		return result;

	}

	/** 编辑模板 */
	async editMeetTemp() {
		await this.isAdmin();

		let rules = {
			id: 'must|id',
			isLimit: 'must|bool|name=是否限制',
			limit: 'must|int|name=人数上限',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		let result = service.editMeetTemp(input);

		return result;
	}

	/** 模板列表 */
	async getMeetTempList() {
		await this.isAdmin();

		let service = new AdminMeetService();
		let result = await service.getMeetTempList();

		return result;
	}

	/** 删除模板 */
	async delMeetTemp() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		await service.delMeetTemp(input.id);

	}


	/**************报名数据导出 BEGIN ********************* */
	/** 当前是否有导出文件生成 */
	async joinDataGet() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			isDel: 'int|must', //是否删除已有记录
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();

		if (input.isDel === 1)
			await service.deleteJoinDataExcel(); //先删除

		return await service.getJoinDataURL();
	}

	/** 导出数据 */
	async joinDataExport() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			meetId: 'id|must',
			startDay: 'date|must',
			endDay: 'date|must',
			status: 'int|must|default=1'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		return await service.exportJoinDataExcel(input);
	}

	/** 删除导出的报名数据文件 */
	async joinDataDel() {
		await this.isAdmin();

		// 数据校验
		let rules = {};

		// 取得数据
		let input = this.validateData(rules);

		let service = new AdminMeetService();
		return await service.deleteJoinDataExcel();
	}

	async getAdminPayFlowList() {
		await this.isAdmin();

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int|default=10',
			isTotal: 'bool',
			oldTotal: 'int',
		};

		// 取得数据
		let input = this.validateData(rules);

		const PayService = require('../../service/pay_service.js');
		let service = new PayService();
		let result = await service.getPayFlowList(null, input);

		// 数据格式化
		let list = result.list;
		for (let k = 0; k < list.length; k++) {
			list[k].PAY_ADD_TIME = timeUtil.timestamp2Time(list[k].PAY_ADD_TIME);
			list[k].PAY_REFUND_TIME = timeUtil.timestamp2Time(list[k].PAY_REFUND_TIME);
			list[k].PAY_END_TIME = timeUtil.timestamp2Time(list[k].PAY_END_TIME);
			list[k].PAY_USER_ID = list[k].PAY_USER_ID.split('^^^')[1];

		}
		result.list = list;

		return result;

	}


}

module.exports = AdminMeetController;