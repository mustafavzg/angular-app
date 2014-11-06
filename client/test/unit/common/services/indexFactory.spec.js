ddescribe('indexFactory', function () {

	var foobar, indexFactory, idFunction;
	beforeEach(module('services.indexFactory'));
	beforeEach(inject(
		function ($injector) {
			indexFactory = $injector.get('indexFactory');
		}
	));
	beforeEach(function () {
		foobar = [
			{
				a: 1,
				b: 2,
				c: 1,
				d: 1
			},
			{
				a: 1,
				b: 3,
				c: 1,
				d: 4
			},
			{
				a: 2,
				b: 4,
				c: 6,
				d: 8
			},
			{
				a: 3,
				b: 6,
				c: 9,
				d: 12
			},
			{
				a: 4,
				b: 8,
				c: 16,
				d: 64
			},
			{
				a: 4,
				b: 15,
				c: 16,
				d: 64
			}
		];

		idFunction = function (item) {
			return item.b;
		};

	});

	// it('should create the correct index', function () {
	// 	var indexMap = indexFactory(foobar, idFunction, 'a', 'c')
	// 	expect(indexMap[1][1].lookUpList([2,3])).toEqual(
	// 		[
	// 			{
	// 				a: 1,
	// 				b: 2,
	// 				c: 1,
	// 				d: 1
	// 			},
	// 			{
	// 				a: 1,
	// 				b: 3,
	// 				c: 1,
	// 				d: 4
	// 			}
	// 		]
	// 	);
	// 	expect(indexMap[2][6].lookUp(4)).toEqual({
	// 		a: 2,
	// 		b: 4,
	// 		c: 6,
	// 		d: 8
	// 	});

	// 	expect(indexMap[3][9].lookUp(6)).toEqual({
	// 		a: 3,
	// 		b: 6,
	// 		c: 9,
	// 		d: 12
	// 	});

	// 	expect(indexMap[4][16].lookUpList([8,15])).toEqual(
	// 		[
	// 			{
	// 				a: 4,
	// 				b: 8,
	// 				c: 16,
	// 				d: 64
	// 			},
	// 			{
	// 				a: 4,
	// 				b: 15,
	// 				c: 16,
	// 				d: 64
	// 			}
	// 		]
	// 	);
	// });

	// it('should ', function () {
	//   expect(true).toBeFalsy();
	// });

	it('should ', function () {
	  expect(true).toBeTruthy();
	});

});