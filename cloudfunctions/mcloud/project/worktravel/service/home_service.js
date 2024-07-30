/**
 * Notes: 全局/首页模块业务逻辑
 * Date: 2021-03-15 04:00:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const setupUtil = require('../../../framework/utils/setup/setup_util.js'); 
const ProductModel = require('../model/product_model.js');
const MeetModel = require('../model/meet_model.js');

class HomeService extends BaseProjectService {

	async getSetup(key) {
		return await setupUtil.get(key);
	}

	/**首页列表 */
	async getHomeList() {
		let where = {
			PRODUCT_STATUS: 1, 
		};
		let orderBy = {
			'PRODUCT_VOUCH': 'desc',
			'PRODUCT_ORDER': 'asc',
			'PRODUCT_ADD_TIME': 'desc'
		}
		let fields = 'PRODUCT_TITLE,PRODUCT_CATE_NAME,PRODUCT_OBJ.cover';
		let productList = await ProductModel.getAll(where, fields, orderBy, 10);
		for (let k = 0; k < productList.length; k++) {
		 
		}


		where = {
			MEET_STATUS: 1,
			MEET_CATE_ID: '1',
		};
		orderBy = {
			'MEET_VOUCH': 'desc',
			'MEET_ORDER': 'asc',
			'MEET_ADD_TIME': 'desc'
		}
		fields = 'MEET_TITLE,MEET_CATE_NAME,MEET_OBJ.cover,MEET_OBJ.level,MEET_OBJ.tag';
		let meetList = await MeetModel.getAll(where, fields, orderBy, 10);
		for (let k = 0; k < meetList.length; k++) {
			meetList[k]['MEET_OBJ'].level = Number(meetList[k]['MEET_OBJ'].level);
		}

		return { productList, meetList }
	}
}

module.exports = HomeService;