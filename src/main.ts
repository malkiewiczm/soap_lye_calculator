interface Oil {
	id: number;
	name: string;
	koh_sap: number;
	naoh_sap: number;
	iodine: number;
	ins: number;
	lauric: number;
	myristic: number;
	palmitic: number;
	stearic: number;
	ricinoleic: number;
	oleic: number;
	linoleic: number;
	linolenic: number;
	hard: number;
	cleansing: number;
	bubbly: number;
	conditioning: number;
	creamy: number;
	saturated: number;
	mono_unsaturated: number;
	poly_unsaturated: number;
}

type OilIdMap = { [key: number]: Oil };

const enum WaterMode {
	Ratio, Percent, PercentOfOil
}

const enum DualLyeMode {
	NaOH, KOH, Dual
}

interface Inputs {
	dual_lye: DualLyeMode;
	naoh_part: number;
	koh_part: number;
	naoh_purity: number;
	koh_purity: number;
	oil_weight: number | null;
	water: number;
	water_mode: WaterMode;
	super_fat: number;
	additive: number;
	oil_list: number[];
	oil_parts: number[];
}

window.addEventListener('load', () => {
	function new_inputs(): Inputs {
		return {
			dual_lye: DualLyeMode.NaOH,
			naoh_part: 100,
			naoh_purity: 1.0,
			koh_part: 0.0,
			koh_purity: 0.9,
			oil_weight: null,
			water: 2.0,
			water_mode: WaterMode.Ratio,
			super_fat: 0.05,
			additive: 0.0,
			oil_list: [],
			oil_parts: [],
		};
	}
	let inputs = new_inputs();
	let all_oils = get_all_oils();
	let all_oils_by_id_map: OilIdMap = {};
	all_oils.forEach((oil) => {
		all_oils_by_id_map[oil.id] = oil;
	});
	let oil_sorted_by: Oil | null = null;
	all_oils.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});
	let all_oils_table_body = by_id('all_oils_table_body');
	let recipe_oils_table_body = by_id('recipe_oils_table_body');
	let oil_search_bar = by_id('oil_search_bar') as HTMLInputElement;
	let oil_table_filter = new_regex('');
	let filter_info_text = by_id('filter_info_text');
	let lye_naoh_input = by_id('lye_naoh') as HTMLInputElement;
	let lye_koh_input = by_id('lye_koh') as HTMLInputElement;
	let dual_lye_input = by_id('dual_lye') as HTMLInputElement;
	let naoh_part_input = by_id('naoh_part') as HTMLInputElement;
	let naoh_purity_input = by_id('naoh_purity') as HTMLInputElement;
	let koh_part_input = by_id('koh_part') as HTMLInputElement;
	let koh_purity_input = by_id('koh_purity') as HTMLInputElement;
	let oil_weight_input = by_id('oil_weight') as HTMLInputElement;
	let lye_solution_percent_input = by_id('lye_solution_percent') as HTMLInputElement;
	let lye_ratio_input = by_id('lye_ratio') as HTMLInputElement;
	let water_percent_of_oil_input = by_id('water_percent_of_oil') as HTMLInputElement;
	let additive_percent_input = by_id('additive_percent') as HTMLInputElement;
	let additive_oz_lb_input = by_id('additive_oz_lb') as HTMLInputElement;
	let additive_g_kg_input = by_id('additive_g_kg') as HTMLInputElement;
	let super_fat_percent_input = by_id('super_fat_percent') as HTMLInputElement;
	let lye_discount_percent_input = by_id('lye_discount_percent') as HTMLInputElement;
	let convert_to_percent_based_recipe_btn = by_id('convert_to_percent_based_recipe_btn') as HTMLButtonElement;
	let convert_to_weight_based_recipe_btn = by_id('convert_to_weight_based_recipe_btn') as HTMLButtonElement;
	let recipe_graph_canvas = by_id('recipe_graph_canvas') as HTMLCanvasElement;
	let recipe_graph_ctx = recipe_graph_canvas.getContext('2d') as CanvasRenderingContext2D;
	let import_recipe_input = by_id('import_recipe') as HTMLInputElement;
	let export_recipe_json = by_id('export_recipe_json');
	function re_add_oils_to_table() {
		all_oils_table_body.replaceChildren();
		let filtered_count = 0;
		all_oils.forEach((oil) => {
			if (!test_regex(oil_table_filter, oil.name)) {
				++filtered_count;
				return;
			}
			let tr = append_element(all_oils_table_body, 'tr', '');
			let add_btn = append_element(append_element(tr, 'td', ''), 'button', 'Add') as HTMLButtonElement;
			add_btn.type = 'button';
			add_btn.addEventListener('click', () => {
				add_oil_to_recipe(oil);
			});
			append_element(tr, 'td', oil.name.toString());
			append_element(tr, 'td', round4(oil.naoh_sap).toString());
			append_element(tr, 'td', oil.koh_sap.toString());
			append_element(tr, 'td', oil.hard.toString());
			append_element(tr, 'td', oil.cleansing.toString());
			append_element(tr, 'td', oil.bubbly.toString());
			append_element(tr, 'td', oil.conditioning.toString());
			append_element(tr, 'td', oil.creamy.toString());
			append_element(tr, 'td', oil.iodine.toString());
			append_element(tr, 'td', oil.ins.toString());
			append_element(tr, 'td', oil.lauric.toString());
			append_element(tr, 'td', oil.myristic.toString());
			append_element(tr, 'td', oil.palmitic.toString());
			append_element(tr, 'td', oil.stearic.toString());
			append_element(tr, 'td', oil.ricinoleic.toString());
			append_element(tr, 'td', oil.oleic.toString());
			append_element(tr, 'td', oil.linoleic.toString());
			append_element(tr, 'td', oil.linolenic.toString());
			append_element(tr, 'td', oil.saturated.toString());
			append_element(tr, 'td', oil.mono_unsaturated.toString());
			append_element(tr, 'td', oil.poly_unsaturated.toString());
			let sort_by_btn = append_element(append_element(tr, 'td', ''), 'button', 'Find Similar Oils') as HTMLButtonElement;
			sort_by_btn.addEventListener('click', () => {
				sort_oils_by_oil(oil);
			});
			append_element(tr, 'td', Math.round(calculate_similarity(oil)).toString());
		});
		filter_info_text.innerText = 'Showing ' + (all_oils.length - filtered_count).toString() + ' out of ' + all_oils.length + ' oils';
	}
	function sort_oils_by(property: string): void {
		all_oils.sort((a: any, b: any) => { return b[property] - a[property]; });
		oil_sorted_by = all_oils[0];
		re_add_oils_to_table();
	}
	function sort_oils_by_oil(oil: Oil): void {
		oil_sorted_by = oil;
		all_oils.sort((a: Oil, b: Oil) => { return calculate_similarity(a) - calculate_similarity(b); });
		re_add_oils_to_table();
	}
	function calculate_similarity(oil: Oil): number {
		if (oil_sorted_by == null) {
			return 0.0;
		}
		let a = get_fatty_acid_vector(oil_sorted_by);
		let b = get_fatty_acid_vector(oil);
		const num_items = a.length;
		let a_mag = sum_of_array(a);
		let b_mag = sum_of_array(b);
		const scale = 100000;
		if (a_mag == 0 || b_mag == 0) {
			return scale;
		}
		let score = 0;
		for (let i = 0; i < num_items; ++i) {
			let diff = (a[i] / a_mag) - (b[i] / b_mag);
			score += diff * diff;
		}
		return (score / num_items) * scale;
	}
	function get_fatty_acid_vector(oil: Oil): number[] {
		return [oil.lauric, oil.myristic, oil.palmitic, oil.stearic, oil.ricinoleic, oil.oleic, oil.linoleic, oil.linolenic];
	}
	by_id('show-readme-btn').addEventListener('click', () => {
		let box = by_id('readme-box');
		box.style.display = (box.style.display != 'block') ? 'block' : 'none';
	});
	by_id('th_name').addEventListener('click', () => {
		all_oils.sort((a, b) => { return a.name.localeCompare(b.name); });
		oil_sorted_by = null;
		re_add_oils_to_table();
	});
	by_id('th_sap_naoh').addEventListener('click', () => { sort_oils_by('naoh_sap'); });
	by_id('th_sap_koh').addEventListener('click', () => { sort_oils_by('sap_koh'); });
	by_id('th_hard').addEventListener('click', () => { sort_oils_by('hard'); });
	by_id('th_cleansing').addEventListener('click', () => { sort_oils_by('cleansing'); });
	by_id('th_bubbly').addEventListener('click', () => { sort_oils_by('bubbly'); });
	by_id('th_conditioning').addEventListener('click', () => { sort_oils_by('conditioning'); });
	by_id('th_creamy').addEventListener('click', () => { sort_oils_by('creamy'); });
	by_id('th_iodine').addEventListener('click', () => { sort_oils_by('iodine'); });
	by_id('th_ins').addEventListener('click', () => { sort_oils_by('ins'); });
	by_id('th_lauric').addEventListener('click', () => { sort_oils_by('lauric'); });
	by_id('th_myristic').addEventListener('click', () => { sort_oils_by('myristic'); });
	by_id('th_palmitic').addEventListener('click', () => { sort_oils_by('palmitic'); });
	by_id('th_stearic').addEventListener('click', () => { sort_oils_by('stearic'); });
	by_id('th_ricinoleic').addEventListener('click', () => { sort_oils_by('ricinoleic'); });
	by_id('th_oleic').addEventListener('click', () => { sort_oils_by('oleic'); });
	by_id('th_linoleic').addEventListener('click', () => { sort_oils_by('linoleic'); });
	by_id('th_linolenic').addEventListener('click', () => { sort_oils_by('linolenic'); });
	by_id('th_saturated').addEventListener('click', () => { sort_oils_by('saturated'); });
	by_id('th_mono_unsaturated').addEventListener('click', () => { sort_oils_by('mono_unsaturated'); });
	by_id('th_poly_unsaturated').addEventListener('click', () => { sort_oils_by('poly_unsaturated'); });
	recipe_graph_canvas.width = 1600;
	recipe_graph_canvas.height = 192;
	re_add_oils_to_table();
	put_inputs_to_ui(-1);
	oil_search_bar.value = '';
	let last_search_bar_value = '';
	function oil_search_bar_on_change() {
		if (last_search_bar_value == oil_search_bar.value) {
			return;
		}
		oil_table_filter = new_regex(oil_search_bar.value);
		last_search_bar_value = oil_search_bar.value;
		re_add_oils_to_table();
	}
	oil_search_bar.addEventListener('change', oil_search_bar_on_change);
	oil_search_bar.addEventListener('keyup', oil_search_bar_on_change);
	by_id('clear_search_btn').addEventListener('click', () => {
		oil_search_bar.value = '';
		oil_search_bar_on_change();
	});
	lye_naoh_input.addEventListener('change', () => {
		if (lye_naoh_input.checked) {
			inputs.dual_lye = DualLyeMode.NaOH;
		}
		inputs.naoh_part = 100;
		inputs.koh_part = 0;
		put_inputs_to_ui(-1);
	});
	lye_koh_input.addEventListener('change', () => {
		if (lye_koh_input.checked) {
			inputs.dual_lye = DualLyeMode.KOH;
		}
		inputs.naoh_part = 0;
		inputs.koh_part = 100;
		put_inputs_to_ui(-1);
	});
	dual_lye_input.addEventListener('change', () => {
		if (dual_lye_input.checked) {
			inputs.dual_lye = DualLyeMode.Dual;
		}
		put_inputs_to_ui(-1);
	});

	oil_weight_input.addEventListener('change', () => {
		if (oil_weight_input.value.trim().length == 0) {
			inputs.oil_weight = null;
			put_inputs_to_ui(-1);
			return;
		}
		let maybe_number = parseFloat(oil_weight_input.value);
		if (!isNaN(maybe_number) && isFinite(maybe_number)) {
			inputs.oil_weight = maybe_number;
			put_inputs_to_ui(-1);
		} else {
			oil_weight_input.style.backgroundColor = 'red';
		}
	});
	convert_to_percent_based_recipe_btn.addEventListener('click', () => {
		let sum_of_parts = get_sum_of_parts();
		if (sum_of_parts == 0) {
			return;
		}
		inputs.oil_parts = inputs.oil_parts.map((value) => {
			return round3(value / sum_of_parts * 100);
		});
		if (inputs.oil_weight == null) {
			inputs.oil_weight = sum_of_parts;
		}
		put_inputs_to_ui(-1);
	});
	convert_to_weight_based_recipe_btn.addEventListener('click', () => {
		if (inputs.oil_weight == null) {
			return;
		}
		let sum_of_parts = get_sum_of_parts();
		if (sum_of_parts == 0) {
			return;
		}
		inputs.oil_parts = inputs.oil_parts.map((value) => {
			if (inputs.oil_weight == null) {
				return 0;
			}
			return round3(value / sum_of_parts * inputs.oil_weight);
		});
		inputs.oil_weight = null;
		put_inputs_to_ui(-1);
	});
	generic_input_parse(naoh_part_input, (value) => {
		if (value < 0) {
			return false;
		}
		inputs.naoh_part = value;
		return true;
	});
	generic_input_parse(koh_part_input, (value) => {
		if (value < 0) {
			return false;
		}
		inputs.koh_part = value;
		return true;
	});
	generic_input_parse(naoh_purity_input, (value) => {
		if (value <= 0 || value > 100) {
			return false;
		}
		inputs.naoh_purity = value / 100.0;
		return true;
	});
	generic_input_parse(koh_purity_input, (value) => {
		if (value <= 0 || value > 100) {
			return false;
		}
		inputs.koh_purity = value / 100.0;
		return true;
	});
	generic_input_parse(lye_solution_percent_input, (value) => {
		if (value <= 0 || value > 100) {
			return false;
		}
		inputs.water = value / 100.0;
		inputs.water_mode = WaterMode.Percent;
		return true;
	});
	generic_input_parse(lye_ratio_input, (value) => {
		if (value <= 0) {
			return false;
		}
		inputs.water = value;
		inputs.water_mode = WaterMode.Ratio;
		return true;
	});
	generic_input_parse(water_percent_of_oil_input, (value) => {
		if (value <= 0 || value > 100) {
			return false;
		}
		inputs.water = value / 100.0;
		inputs.water_mode = WaterMode.PercentOfOil;
		return true;
	});
	generic_input_parse(additive_percent_input, (value) => {
		if (value < 0) {
			return false;
		}
		inputs.additive = value / 100.0;
		return true;
	});
	generic_input_parse(additive_oz_lb_input, (value) => {
		if (value < 0) {
			return false;
		}
		inputs.additive = value / 16.0;
		return true;
	});
	generic_input_parse(additive_g_kg_input, (value) => {
		if (value < 0) {
			return false;
		}
		inputs.additive = value / 1000.0;
		return true;
	});
	generic_input_parse(super_fat_percent_input, (value) => {
		inputs.super_fat = value / 100.0;
		return true;
	});
	generic_input_parse(lye_discount_percent_input, (value) => {
		if (value >= 100) {
			return false;
		}
		inputs.super_fat = value / (100.0 - value);
		return true;
	});
	let prev_inputs = new_inputs();
	by_id('reset_btn').addEventListener('click', () => {
		if (!inputs_are_default()) {
			prev_inputs = inputs;
			inputs = new_inputs();
		}
		put_inputs_to_ui(-1);
	});
	by_id('undo_reset_btn').addEventListener('click', () => {
		inputs = prev_inputs;
		put_inputs_to_ui(-1);
	});
	by_id('import_recipe_btn').addEventListener('click', () => {
		let import_recipe_feedback = by_id('import_recipe_feedback');
		let result = import_recipe(import_recipe_input.value, (parsed_inputs) => {
			inputs = parsed_inputs;
			put_inputs_to_ui(-1);
		});
		import_recipe_feedback.style.display = 'inline-block';
		if (result.length == 0) {
			import_recipe_feedback.style.backgroundColor = '#e3fafc';
			import_recipe_feedback.innerText = 'Import success.';
		} else {
			import_recipe_feedback.style.backgroundColor = 'red';
			import_recipe_feedback.innerText = result;
		}
	});
	window.addEventListener('keydown', (e) => {
		if (e.target && 'nodeName' in e.target) {
			let node = e.target as Node;
			if (node.nodeName == 'INPUT') {
				return true;
			}
		}
		if (e.key == '/') {
			oil_search_bar.focus();
			e.preventDefault();
			return false;
		}
		return true;
	});
	function put_inputs_to_ui(focus_hint: number): void {
		let sum_of_parts = get_sum_of_parts();
		let sum_of_oil = (inputs.oil_weight == null) ? sum_of_parts : inputs.oil_weight;
		let sum_of_naoh = 0;
		let sum_of_koh = 0;
		let lye_multiplier = 1 / (1 + inputs.super_fat);
		let recipe_hard = 0;
		let recipe_cleansing = 0;
		let recipe_bubbly = 0;
		let recipe_conditioning = 0;
		let recipe_creamy = 0;
		let recipe_iodine = 0;
		let recipe_ins = 0;
		let recipe_lauric = 0;
		let recipe_myristic = 0;
		let recipe_palmitic = 0;
		let recipe_stearic = 0;
		let recipe_ricinoleic = 0;
		let recipe_oleic = 0;
		let recipe_linoleic = 0;
		let recipe_linolenic = 0;
		let recipe_saturated = 0;
		let recipe_mono_unsaturated = 0;
		let recipe_poly_unsaturated = 0;
		let naoh_multiplier = 0;
		let koh_multiplier = 0;
		const naoh_fraction = (inputs.naoh_part + inputs.koh_part == 0) ? 1.0 : (inputs.naoh_part / (inputs.naoh_part + inputs.koh_part));
		switch (inputs.dual_lye) {
			case DualLyeMode.NaOH:
				naoh_multiplier = 1.0 / inputs.naoh_purity;
				koh_multiplier = 0.0;
				naoh_part_input.disabled = true;
				koh_part_input.disabled = true;
				naoh_purity_input.disabled = false;
				koh_purity_input.disabled = true;
				break;
			case DualLyeMode.KOH:
				naoh_multiplier = 0.0;
				koh_multiplier = 1.0 / inputs.koh_purity;
				naoh_part_input.disabled = true;
				koh_part_input.disabled = true;
				naoh_purity_input.disabled = true;
				koh_purity_input.disabled = false;
				break;
			case DualLyeMode.Dual:
				naoh_multiplier = naoh_fraction / inputs.naoh_purity;
				koh_multiplier = (1.0 - naoh_fraction) / inputs.koh_purity;
				naoh_part_input.disabled = false;
				koh_part_input.disabled = false;
				naoh_purity_input.disabled = false;
				koh_purity_input.disabled = false;
				break;
			default:
				naoh_part_input.disabled = true;
				koh_part_input.disabled = true;
				naoh_purity_input.disabled = true;
				koh_purity_input.disabled = true;
		}
		naoh_part_input.value = inputs.naoh_part.toString();
		koh_part_input.value = inputs.koh_part.toString();
		naoh_purity_input.value = (inputs.naoh_purity * 100).toString();
		koh_purity_input.value = (inputs.koh_purity * 100).toString();
		naoh_part_input.style.backgroundColor = '';
		koh_part_input.style.backgroundColor = '';
		naoh_purity_input.style.backgroundColor = '';
		koh_purity_input.style.backgroundColor = '';
		convert_to_weight_based_recipe_btn.disabled = (inputs.oil_weight == null);
		lye_naoh_input.checked = inputs.dual_lye == DualLyeMode.NaOH;
		lye_koh_input.checked = inputs.dual_lye == DualLyeMode.KOH;
		dual_lye_input.checked = inputs.dual_lye == DualLyeMode.Dual;
		by_id('header_required_naoh_info').style.display = (inputs.dual_lye == DualLyeMode.KOH) ? 'none' : '';
		by_id('required_naoh_info').style.display = (inputs.dual_lye == DualLyeMode.KOH) ? 'none' : '';
		by_id('header_required_koh_info').style.display = (inputs.dual_lye == DualLyeMode.NaOH) ? 'none' : '';
		by_id('required_koh_info').style.display = (inputs.dual_lye == DualLyeMode.NaOH) ? 'none' : '';
		oil_weight_input.value = (inputs.oil_weight == null) ? '' : inputs.oil_weight.toString();
		oil_weight_input.style.backgroundColor = '';
		super_fat_percent_input.value = (inputs.super_fat * 100.0).toString();
		super_fat_percent_input.style.backgroundColor = '';
		lye_discount_percent_input.value = ((1.0 - lye_multiplier) * 100.0).toString();
		lye_discount_percent_input.style.backgroundColor = '';
		recipe_oils_table_body.replaceChildren();
		by_id('lye_multiplier_info').innerText = lye_multiplier.toString();
		by_id('super_fat_percent_info').innerText = round3(inputs.super_fat * 100.0).toString();
		inputs.oil_list.forEach((oil_id, index) => {
			let oil = get_oil_by_id(oil_id);
			let tr = append_element(recipe_oils_table_body, 'tr', '');
			let remove_btn = append_element(append_element(tr, 'td', ''), 'button', 'Remove') as HTMLButtonElement;
			remove_btn.type = 'button';
			remove_btn.addEventListener('click', () => {
				inputs.oil_list.splice(index, 1);
				inputs.oil_parts.splice(index, 1);
				put_inputs_to_ui(clamp(index, 0, inputs.oil_list.length - 1));
			});
			append_element(tr, 'td', oil.name);
			let weight_input = append_element(tr, 'input', '') as HTMLInputElement;
			weight_input.value = inputs.oil_parts[index].toString();
			weight_input.addEventListener('change', () => {
				let maybe_number = parseFloat(weight_input.value);
				if (!isNaN(maybe_number) && isFinite(maybe_number)) {
					inputs.oil_parts[index] = maybe_number;
					put_inputs_to_ui(index);
				} else {
					weight_input.style.backgroundColor = 'red';
				}
			});
			if (index == focus_hint) {
				weight_input.focus();
			}
			if (sum_of_parts <= 0) {
				append_element(tr, 'td', '--');
				append_element(tr, 'td', '0');
			} else {
				let fraction = inputs.oil_parts[index] / sum_of_parts;
				let actual_weight = fraction * sum_of_oil;
				append_element(tr, 'td', round4(fraction * 100.0).toString());
				append_element(tr, 'td', round4(actual_weight).toString());
				sum_of_naoh += actual_weight * naoh_multiplier * lye_multiplier * oil.naoh_sap;
				sum_of_koh += actual_weight * koh_multiplier * lye_multiplier * oil.koh_sap;
				recipe_hard += oil.hard * fraction;
				recipe_cleansing += oil.cleansing * fraction;
				recipe_bubbly += oil.bubbly * fraction;
				recipe_conditioning += oil.conditioning * fraction;
				recipe_creamy += oil.creamy * fraction;
				recipe_iodine += oil.iodine * fraction;
				recipe_ins += oil.ins * fraction;
				recipe_lauric += oil.lauric * fraction;
				recipe_myristic += oil.myristic * fraction;
				recipe_palmitic += oil.palmitic * fraction;
				recipe_stearic += oil.stearic * fraction;
				recipe_ricinoleic += oil.ricinoleic * fraction;
				recipe_oleic += oil.oleic * fraction;
				recipe_linoleic += oil.linoleic * fraction;
				recipe_linolenic += oil.linolenic * fraction;
				recipe_saturated += oil.saturated * fraction;
				recipe_mono_unsaturated += oil.mono_unsaturated * fraction;
				recipe_poly_unsaturated += oil.poly_unsaturated * fraction;
			}
		});
		function add_graph(label: string, ideal_low: number, ideal_high: number, ctx: CanvasRenderingContext2D, row: number, col: number, spikes: number[], actual: number): void {
			const COLOR_TEXT = '#000000';
			const COLOR_BG = '#a57abc';
			const COLOR_BG_ALT = '#b1c8dd';
			const COLOR_IDEAL = '#ceb1dd';
			const COLOR_SPIKE = '#000000';
			const COLOR_HATCH = '#000000';
			const TEXT_PAD = 100;
			const TEXT_LEFT_MARGIN = 10;
			const HEIGHT = 20;
			const PADDING = 4;
			const WIDTH = recipe_graph_canvas.width * 0.5 - TEXT_PAD;
			const MULT = WIDTH / 100.0;
			const SPIKE_WIDTH = HEIGHT / 2;
			const y = row * (HEIGHT + PADDING);
			const x = col * recipe_graph_canvas.width * 0.5 + TEXT_PAD;
			ctx.font = '16px arial';
			ctx.fillStyle = COLOR_TEXT;
			ctx.fillText(label, x - TEXT_PAD + TEXT_LEFT_MARGIN * col, y + HEIGHT);
			ctx.fillStyle = (ideal_low < ideal_high) ? COLOR_BG : COLOR_BG_ALT;
			ctx.fillRect(x, y, WIDTH, HEIGHT);
			ctx.fillStyle = COLOR_IDEAL;
			if (ideal_low < ideal_high) {
				let ideal_width = (ideal_high - ideal_low) * MULT;
				let ideal_x = x + ideal_low * MULT;
				ctx.fillRect(ideal_x, y, ideal_width, HEIGHT);
			}
			spikes.forEach((spike) => {
				ctx.fillStyle = COLOR_SPIKE;
				add_spike(ctx, x + clamp(spike, 0, 100) * MULT, y, SPIKE_WIDTH, HEIGHT);
			});
			ctx.strokeStyle = COLOR_HATCH;
			add_hatches(ctx, x, y, clamp(actual, 0, 100) * MULT, HEIGHT);
		}
		function add_spike(ctx: CanvasRenderingContext2D, x: number, y: number, half_width: number, height: number): void {
			ctx.beginPath();
			ctx.moveTo(x - half_width, y);
			ctx.lineTo(x, y + height);
			ctx.lineTo(x + half_width, y);
			ctx.fill();
		}
		function add_hatches(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
			if (w == 0) {
				return;
			}
			ctx.beginPath();
			const STEP = 7;
			let x1 = -1;
			for (let dx = STEP; dx <= w; dx += STEP) {
				const x0 = x + dx - STEP;
				x1 = x + dx;
				ctx.moveTo(x0, y);
				ctx.lineTo(x1, y + h);
			}
			if (x1 > 0 && x1 < x + w) {
				ctx.moveTo(x1, y);
				ctx.lineTo(x + w, y + h * (x1 - x - w) / (- STEP));
			}
			ctx.moveTo(x + w, y);
			ctx.lineTo(x + w, y + h);
			ctx.stroke();
		}
		let sum_of_water = 0;
		const sum_of_lye = sum_of_naoh + sum_of_koh;
		const unknown_value = 'Unknown until oils are added';
		if (inputs.water_mode == WaterMode.PercentOfOil) {
			sum_of_water = sum_of_oil * inputs.water;
			water_percent_of_oil_input.value = (inputs.water * 100.0).toString();
			if (sum_of_oil == 0 || sum_of_lye == 0) {
				lye_solution_percent_input.value = unknown_value;
				lye_ratio_input.value = unknown_value;
			} else {
				lye_solution_percent_input.value = (sum_of_lye / (sum_of_lye + sum_of_water) * 100.0).toString();
				lye_ratio_input.value = (sum_of_water / sum_of_lye).toString();
			}
		} else if (inputs.water_mode == WaterMode.Ratio) {
			sum_of_water = sum_of_lye * inputs.water;
			lye_ratio_input.value = inputs.water.toString();
			lye_solution_percent_input.value = (100 / (inputs.water + 1)).toString();
			if (sum_of_oil == 0 || sum_of_lye == 0) {
				water_percent_of_oil_input.value = unknown_value;
			} else {
				water_percent_of_oil_input.value = (sum_of_water / sum_of_oil * 100.0).toString();
			}
		} else {
			sum_of_water = sum_of_lye / inputs.water - sum_of_lye;
			lye_solution_percent_input.value = (inputs.water * 100.0).toString();
			lye_ratio_input.value = ((1 / inputs.water) - 1).toString();
			if (sum_of_oil == 0 || sum_of_lye == 0) {
				water_percent_of_oil_input.value = unknown_value;
			} else {
				water_percent_of_oil_input.value = (sum_of_water / sum_of_oil * 100.0).toString();
			}
		}
		lye_solution_percent_input.style.backgroundColor = '';
		lye_ratio_input.style.backgroundColor = '';
		water_percent_of_oil_input.style.backgroundColor = '';

		additive_percent_input.value = (inputs.additive * 100.0).toString();
		additive_oz_lb_input.value = (inputs.additive * 16.0).toString();
		additive_g_kg_input.value = (inputs.additive * 1000.0).toString();
		additive_percent_input.style.backgroundColor = '';
		additive_oz_lb_input.style.backgroundColor = '';
		additive_g_kg_input.style.backgroundColor = '';
		by_id('header_required_additive_info').style.display = (inputs.additive == 0) ? 'none' : '';
		by_id('required_additive_info').style.display = (inputs.additive == 0) ? 'none' : '';
		const sum_of_additive = inputs.additive * sum_of_oil;

		let total_tr = append_element(recipe_oils_table_body, 'tr', '');
		total_tr.style.backgroundColor = '#d5daea';
		append_element(total_tr, 'td', '');
		append_element(total_tr, 'td', 'Sum');
		append_element(total_tr, 'td', sum_of_parts.toString());
		append_element(total_tr, 'td', '100');
		append_element(total_tr, 'td', sum_of_oil.toString());

		by_id('oil_weight_info').innerText = sum_of_oil.toString() + ((inputs.oil_weight == null) ? ' (inferred from recipe)' : ' (explicitly set above)');

		by_id('required_water_info').innerText = round3(sum_of_water).toString();
		by_id('naoh_percent_info').innerText = round3(naoh_fraction * 100).toString();
		by_id('naoh_multiplier_info').innerText = round4(naoh_multiplier).toString();
		by_id('koh_percent_info').innerText = round3((1 - naoh_fraction) * 100).toString();
		by_id('koh_multiplier_info').innerText = round4(koh_multiplier).toString();
		by_id('required_naoh_info').innerText = round3(sum_of_naoh).toString();
		by_id('required_koh_info').innerText = round3(sum_of_koh).toString();
		by_id('water_lye_sum_info').innerText = round3(sum_of_water + sum_of_lye).toString();
		by_id('required_additive_info').innerText = round3(sum_of_additive).toString();
		by_id('oil_water_lye_sum_info').innerText = round3(sum_of_oil + sum_of_water + sum_of_lye + sum_of_additive).toString();
		by_id('recipe_hard_info').innerText = round3(recipe_hard).toString();
		by_id('recipe_cleansing_info').innerText = round3(recipe_cleansing).toString();
		by_id('recipe_bubbly_info').innerText = round3(recipe_bubbly).toString();
		by_id('recipe_conditioning_info').innerText = round3(recipe_conditioning).toString();
		by_id('recipe_creamy_info').innerText = round3(recipe_creamy).toString();
		by_id('recipe_iodine_info').innerText = round3(recipe_iodine).toString();
		by_id('recipe_ins_info').innerText = round3(recipe_ins).toString();
		by_id('recipe_lauric_info').innerText = round3(recipe_lauric).toString();
		by_id('recipe_myristic_info').innerText = round3(recipe_myristic).toString();
		by_id('recipe_palmitic_info').innerText = round3(recipe_palmitic).toString();
		by_id('recipe_stearic_info').innerText = round3(recipe_stearic).toString();
		by_id('recipe_ricinoleic_info').innerText = round3(recipe_ricinoleic).toString();
		by_id('recipe_oleic_info').innerText = round3(recipe_oleic).toString();
		by_id('recipe_linoleic_info').innerText = round3(recipe_linoleic).toString();
		by_id('recipe_linolenic_info').innerText = round3(recipe_linolenic).toString();
		by_id('recipe_saturated_info').innerText = round3(recipe_saturated).toString();
		by_id('recipe_mono_unsaturated_info').innerText = round3(recipe_mono_unsaturated).toString();
		by_id('recipe_poly_unsaturated_info').innerText = round3(recipe_poly_unsaturated).toString();

		recipe_graph_ctx.clearRect(0, 0, recipe_graph_canvas.width, recipe_graph_canvas.height);
		add_graph('Hard', 29, 54, recipe_graph_ctx, 0, 0, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).hard), recipe_hard);
		add_graph('Cleansing', 12, 22, recipe_graph_ctx, 1, 0, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).cleansing), recipe_cleansing);
		add_graph('Bubbly', 14, 46, recipe_graph_ctx, 2, 0, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).bubbly), recipe_bubbly);
		add_graph('Conditioning', 44, 69, recipe_graph_ctx, 3, 0, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).conditioning), recipe_conditioning);
		add_graph('Creamy', 16, 48, recipe_graph_ctx, 4, 0, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).creamy), recipe_creamy);
		add_graph('Iodine', 41, 70, recipe_graph_ctx, 5, 0, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).iodine), recipe_iodine);

		add_graph('Lauric', 0, 0, recipe_graph_ctx, 0, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).lauric), recipe_lauric);
		add_graph('Myristic', 0, 0, recipe_graph_ctx, 1, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).myristic), recipe_myristic);
		add_graph('Palmitic', 0, 0, recipe_graph_ctx, 2, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).palmitic), recipe_palmitic);
		add_graph('Stearic', 0, 0, recipe_graph_ctx, 3, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).stearic), recipe_stearic);
		add_graph('Ricinoleic', 0, 0, recipe_graph_ctx, 4, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).ricinoleic), recipe_ricinoleic);
		add_graph('Oleic', 0, 0, recipe_graph_ctx, 5, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).oleic), recipe_oleic);
		add_graph('Linoleic', 0, 0, recipe_graph_ctx, 6, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).linoleic), recipe_linoleic);
		add_graph('Linolenic', 0, 0, recipe_graph_ctx, 7, 1, inputs.oil_list.map((oil_id) => get_oil_by_id(oil_id).linolenic), recipe_linolenic);

		export_recipe_json.innerText = JSON.stringify(inputs);
	}
	function add_oil_to_recipe(oil: Oil): void {
		inputs.oil_list.push(oil.id);
		inputs.oil_parts.push(0.0);
		put_inputs_to_ui(-1);
	}
	function by_id(id: string): HTMLElement {
		let element = document.getElementById(id);
		if (element) {
			return element;
		}
		const error_msg = 'Could not find id "' + id + '" in document';
		document.body.innerText = error_msg;
		throw error_msg;
	}
	function new_regex(pattern: string): RegExp | null {
		try {
			return new RegExp(pattern, 'i');
		} catch (e) {
			return null;
		}
	}
	function test_regex(regex: RegExp | null, target: string): boolean {
		if (regex) {
			return regex.test(target);
		} else {
			return false;
		}
	}
	function clamp(x: number, low: number, high: number): number {
		if (x < low) {
			return low;
		} else if (x > high) {
			return high;
		} else {
			return x;
		}
	}
	function round3(x: number): number {
		return Math.round(x * 1e3) / 1e3;
	}
	function round4(x: number): number {
		return Math.round(x * 1e4) / 1e4;
	}
	function generic_input_parse(input: HTMLInputElement, cb: (value: number) => boolean): void {
		input.addEventListener('change', () => {
			let maybe_number = parseFloat(input.value);
			if (!isNaN(maybe_number) && isFinite(maybe_number) && cb(maybe_number)) {
				put_inputs_to_ui(-1);
			} else {
				input.style.backgroundColor = 'red';
			}
		});
	}
	function import_recipe(json_text: string, on_ok: (value: Inputs) => void): string {
		try {
			let parsed_inputs = JSON.parse(json_text);
			if (typeof parsed_inputs !== 'object') {
				return 'Input is not an object';
			}
			let default_inputs = new_inputs();
			for (let prop in default_inputs) {
				if (!(prop in parsed_inputs)) {
					return 'Missing property: ' + prop;
				}
				let parsed_type = typeof ((parsed_inputs as any)[prop]);
				let expected_type = typeof ((default_inputs as any)[prop]);
				if (prop == 'oil_weight') {
					if ((parsed_inputs as any)[prop] !== null && parsed_type != 'number') {
						return prop + ' should be number or null but was ' + parsed_type;
					}
				} else if (parsed_type !== expected_type) {
					return 'For property ' + prop + ' expected type ' + expected_type + ' but got ' + parsed_type;
				}
			}
			if (!is_array_of_numbers(parsed_inputs.oil_list)) {
				return 'oil_list should be a list of numbers';
			}
			if (!is_array_of_numbers(parsed_inputs.oil_parts)) {
				return 'oil_parts should be a list of numbers';
			}
			if (parsed_inputs.oil_list.length !== parsed_inputs.oil_parts.length) {
				return 'Mismatch on oil list size (' + parsed_inputs.oil_list.length.toString() + ') vs oil parts size (' + parsed_inputs.oil_parts.length.toString() + ')';
			}
			for (let i = 0; i < parsed_inputs.oil_list.length; ++i) {
				let oil_id = parsed_inputs.oil_list[i];
				if (!all_oils_by_id_map[oil_id]) {
					return 'Oil with id ' + oil_id + ' is not recognized';
				}
			}
			on_ok(parsed_inputs);
		} catch (err: any) {
			return 'Import encountered problems: ' + err.toString();
		}
		return '';
	}
	function is_array_of_numbers(obj: any): boolean {
		if (typeof (obj) != 'object') {
			return false;
		}
		if (typeof (obj.length) != 'number') {
			return false;
		}
		for (let i = 0; i < obj.length; ++i) {
			if (typeof (obj[i]) != 'number') {
				return false;
			}
		}
		return true;
	}
	function inputs_are_default(): boolean {
		if (inputs.oil_list.length > 0) {
			return false;
		}
		let default_inputs = new_inputs() as any;
		let inputs_obj = inputs as any;
		for (let key in default_inputs) {
			if (inputs_obj[key] !== default_inputs[key]) {
				return false;
			}
		}
		return true;
	}
	function get_sum_of_parts(): number {
		return sum_of_array(inputs.oil_parts);
	}
	function sum_of_array(arr: number[]): number {
		return arr.reduce((prev, current) => {
			return prev + current;
		}, 0.0);
	}
	function append_element(parent: HTMLElement, tag: string, text: string): HTMLElement {
		let element = document.createElement(tag);
		if (text.length > 0) {
			element.appendChild(document.createTextNode(text.toString()));
		}
		parent.appendChild(element);
		return element;
	}
	function get_oil_by_id(id: number): Oil {
		return all_oils_by_id_map[id];
	}
	function get_all_oils(): Oil[] {
		return [{ "id": 145, "name": "Abyssinian Oil", "koh_sap": 0.168, "naoh_sap": 0.11975606487257179, "iodine": 98, "ins": 70, "lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 2, "ricinoleic": 0, "oleic": 18, "linoleic": 11, "linolenic": 4, "hard": 6, "cleansing": 0, "bubbly": 0, "conditioning": 94, "creamy": 80, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 114, "name": "Almond Butter", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 70, "ins": 118, "lauric": 0, "myristic": 1, "palmitic": 9, "stearic": 15, "ricinoleic": 0, "oleic": 58, "linoleic": 16, "linolenic": 0, "hard": 25, "cleansing": 1, "bubbly": 1, "conditioning": 74, "creamy": 24, "saturated": 25, "mono_unsaturated": 58, "poly_unsaturated": 16 }, { "id": 1, "name": "Almond Oil, sweet", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 99, "ins": 97, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 0, "ricinoleic": 0, "oleic": 71, "linoleic": 18, "linolenic": 0, "hard": 7, "cleansing": 0, "bubbly": 0, "conditioning": 89, "creamy": 7, "saturated": 7, "mono_unsaturated": 71, "poly_unsaturated": 18 }, { "id": 68, "name": "Aloe Butter", "koh_sap": 0.24, "naoh_sap": 0.17108009267510255, "iodine": 9, "ins": 241, "lauric": 45, "myristic": 18, "palmitic": 8, "stearic": 3, "ricinoleic": 0, "oleic": 7, "linoleic": 2, "linolenic": 0, "hard": 74, "cleansing": 63, "bubbly": 63, "conditioning": 9, "creamy": 11, "saturated": 74, "mono_unsaturated": 7, "poly_unsaturated": 2 }, { "id": 96, "name": "Andiroba Oil,karaba,crabwood", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 68, "ins": 120, "lauric": 0, "myristic": 0, "palmitic": 28, "stearic": 8, "ricinoleic": 0, "oleic": 51, "linoleic": 9, "linolenic": 0, "hard": 36, "cleansing": 0, "bubbly": 0, "conditioning": 60, "creamy": 36, "saturated": 36, "mono_unsaturated": 51, "poly_unsaturated": 9 }, { "id": 2, "name": "Apricot Kernal Oil", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 100, "ins": 91, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 0, "ricinoleic": 0, "oleic": 66, "linoleic": 27, "linolenic": 0, "hard": 6, "cleansing": 0, "bubbly": 0, "conditioning": 93, "creamy": 6, "saturated": 6, "mono_unsaturated": 66, "poly_unsaturated": 27 }, { "id": 58, "name": "Argan Oil", "koh_sap": 0.191, "naoh_sap": 0.13615124042060245, "iodine": 95, "ins": 95, "lauric": 0, "myristic": 1, "palmitic": 14, "stearic": 0, "ricinoleic": 0, "oleic": 46, "linoleic": 34, "linolenic": 1, "hard": 15, "cleansing": 1, "bubbly": 1, "conditioning": 81, "creamy": 14, "saturated": 15, "mono_unsaturated": 46, "poly_unsaturated": 35 }, { "id": 53, "name": "Avocado butter", "koh_sap": 0.187, "naoh_sap": 0.13329990554268406, "iodine": 67, "ins": 120, "lauric": 0, "myristic": 0, "palmitic": 21, "stearic": 10, "ricinoleic": 0, "oleic": 53, "linoleic": 6, "linolenic": 2, "hard": 31, "cleansing": 0, "bubbly": 0, "conditioning": 61, "creamy": 31, "saturated": 31, "mono_unsaturated": 53, "poly_unsaturated": 8 }, { "id": 3, "name": "Avocado Oil", "koh_sap": 0.186, "naoh_sap": 0.13258707182320448, "iodine": 86, "ins": 99, "lauric": 0, "myristic": 0, "palmitic": 20, "stearic": 2, "ricinoleic": 0, "oleic": 58, "linoleic": 12, "linolenic": 0, "hard": 22, "cleansing": 0, "bubbly": 0, "conditioning": 70, "creamy": 22, "saturated": 22, "mono_unsaturated": 58, "poly_unsaturated": 12 }, { "id": 4, "name": "Babassu Oil", "koh_sap": 0.245, "naoh_sap": 0.17464426127250052, "iodine": 15, "ins": 230, "lauric": 50, "myristic": 20, "palmitic": 11, "stearic": 4, "ricinoleic": 0, "oleic": 10, "linoleic": 0, "linolenic": 0, "hard": 85, "cleansing": 70, "bubbly": 70, "conditioning": 10, "creamy": 15, "saturated": 85, "mono_unsaturated": 10, "poly_unsaturated": 0 }, { "id": 59, "name": "Baobab Oil", "koh_sap": 0.2, "naoh_sap": 0.1425667438959188, "iodine": 75, "ins": 125, "lauric": 0, "myristic": 1, "palmitic": 24, "stearic": 4, "ricinoleic": 0, "oleic": 37, "linoleic": 28, "linolenic": 2, "hard": 29, "cleansing": 1, "bubbly": 1, "conditioning": 67, "creamy": 28, "saturated": 29, "mono_unsaturated": 37, "poly_unsaturated": 30 }, { "id": 5, "name": "Beeswax", "koh_sap": 0.094, "naoh_sap": 0.06700636963108184, "iodine": 10, "ins": 84, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 90, "cleansing": 0, "bubbly": 0, "conditioning": 50, "creamy": 50, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 6, "name": "Black Cumin Seed Oil, nigella sativa", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 133, "ins": 62, "lauric": 0, "myristic": 0, "palmitic": 13, "stearic": 3, "ricinoleic": 0, "oleic": 22, "linoleic": 60, "linolenic": 1, "hard": 16, "cleansing": 0, "bubbly": 0, "conditioning": 83, "creamy": 16, "saturated": 16, "mono_unsaturated": 22, "poly_unsaturated": 61 }, { "id": 136, "name": "Black Current Seed Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 178, "ins": 12, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 13, "linoleic": 46, "linolenic": 29, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 8, "saturated": 8, "mono_unsaturated": 13, "poly_unsaturated": 75 }, { "id": 66, "name": "Borage Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 135, "ins": 55, "lauric": 0, "myristic": 0, "palmitic": 10, "stearic": 4, "ricinoleic": 0, "oleic": 20, "linoleic": 43, "linolenic": 5, "hard": 14, "cleansing": 0, "bubbly": 0, "conditioning": 68, "creamy": 14, "saturated": 14, "mono_unsaturated": 20, "poly_unsaturated": 48 }, { "id": 146, "name": "Brazil Nut Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 100, "ins": 90, "lauric": 0, "myristic": 0, "palmitic": 13, "stearic": 11, "ricinoleic": 0, "oleic": 39, "linoleic": 36, "linolenic": 0, "hard": 24, "cleansing": 0, "bubbly": 0, "conditioning": 75, "creamy": 24, "saturated": 24, "mono_unsaturated": 39, "poly_unsaturated": 36 }, { "id": 138, "name": "Broccoli Seed Oil, Brassica Oleracea", "koh_sap": 0.172, "naoh_sap": 0.12260739975049015, "iodine": 105, "ins": 67, "lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 1, "ricinoleic": 0, "oleic": 14, "linoleic": 11, "linolenic": 9, "hard": 7, "cleansing": 0, "bubbly": 0, "conditioning": 93, "creamy": 6, "saturated": 6, "mono_unsaturated": 70, "poly_unsaturated": 24 }, { "id": 147, "name": "Buriti Oil", "koh_sap": 0.223, "naoh_sap": 0.15896191944394947, "iodine": 70, "ins": 153, "lauric": 0, "myristic": 0, "palmitic": 17, "stearic": 2, "ricinoleic": 0, "oleic": 71, "linoleic": 7, "linolenic": 1, "hard": 19, "cleansing": 0, "bubbly": 0, "conditioning": 79, "creamy": 19, "saturated": 19, "mono_unsaturated": 71, "poly_unsaturated": 8 }, { "id": 60, "name": "Camelina Seed Oil", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 144, "ins": 44, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 24, "linoleic": 19, "linolenic": 45, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 8, "saturated": 8, "mono_unsaturated": 24, "poly_unsaturated": 64 }, { "id": 80, "name": "Camellia Oil, Tea Seed", "koh_sap": 0.193, "naoh_sap": 0.13757690785956164, "iodine": 78, "ins": 115, "lauric": 0, "myristic": 0, "palmitic": 9, "stearic": 2, "ricinoleic": 0, "oleic": 77, "linoleic": 8, "linolenic": 0, "hard": 11, "cleansing": 0, "bubbly": 0, "conditioning": 85, "creamy": 11, "saturated": 11, "mono_unsaturated": 77, "poly_unsaturated": 8 }, { "id": 142, "name": "Candelilla Wax", "koh_sap": 0.044, "naoh_sap": 0.031364683657102134, "iodine": 32, "ins": 12, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 68, "cleansing": 0, "bubbly": 0, "conditioning": 60, "creamy": 60, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 7, "name": "Canola Oil", "koh_sap": 0.186, "naoh_sap": 0.13258707182320448, "iodine": 110, "ins": 56, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 2, "ricinoleic": 0, "oleic": 61, "linoleic": 21, "linolenic": 9, "hard": 6, "cleansing": 0, "bubbly": 0, "conditioning": 91, "creamy": 6, "saturated": 6, "mono_unsaturated": 61, "poly_unsaturated": 30 }, { "id": 84, "name": "Canola Oil, high oleic", "koh_sap": 0.186, "naoh_sap": 0.13258707182320448, "iodine": 96, "ins": 90, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 2, "ricinoleic": 0, "oleic": 74, "linoleic": 12, "linolenic": 4, "hard": 6, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 6, "saturated": 6, "mono_unsaturated": 74, "poly_unsaturated": 16 }, { "id": 144, "name": "Carrot Seed Oil, cold pressed", "koh_sap": 0.144, "naoh_sap": 0.10264805560506152, "iodine": 56, "ins": 0, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 0, "ricinoleic": 0, "oleic": 80, "linoleic": 13, "linolenic": 0, "hard": 4, "cleansing": 0, "bubbly": 0, "conditioning": 93, "creamy": 4, "saturated": 4, "mono_unsaturated": 80, "poly_unsaturated": 13 }, { "id": 8, "name": "Castor Oil", "koh_sap": 0.18, "naoh_sap": 0.1283100695063269, "iodine": 86, "ins": 95, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 90, "oleic": 4, "linoleic": 4, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 90, "conditioning": 98, "creamy": 90, "saturated": 0, "mono_unsaturated": 94, "poly_unsaturated": 4 }, { "id": 79, "name": "Cherry Kern1 Oil, p. avium", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 128, "ins": 62, "lauric": 0, "myristic": 0, "palmitic": 8, "stearic": 3, "ricinoleic": 0, "oleic": 31, "linoleic": 45, "linolenic": 11, "hard": 11, "cleansing": 0, "bubbly": 0, "conditioning": 87, "creamy": 11, "saturated": 11, "mono_unsaturated": 31, "poly_unsaturated": 56 }, { "id": 90, "name": "Cherry Kern2 Oil, p. cerasus", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 118, "ins": 74, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 3, "ricinoleic": 0, "oleic": 50, "linoleic": 40, "linolenic": 0, "hard": 9, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 9, "saturated": 9, "mono_unsaturated": 50, "poly_unsaturated": 40 }, { "id": 56, "name": "Chicken Fat", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 69, "ins": 130, "lauric": 0, "myristic": 1, "palmitic": 25, "stearic": 7, "ricinoleic": 0, "oleic": 38, "linoleic": 21, "linolenic": 0, "hard": 33, "cleansing": 1, "bubbly": 1, "conditioning": 59, "creamy": 32, "saturated": 33, "mono_unsaturated": 38, "poly_unsaturated": 21 }, { "id": 9, "name": "Cocoa Butter", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 37, "ins": 157, "lauric": 0, "myristic": 0, "palmitic": 28, "stearic": 33, "ricinoleic": 0, "oleic": 35, "linoleic": 3, "linolenic": 0, "hard": 61, "cleansing": 0, "bubbly": 0, "conditioning": 38, "creamy": 61, "saturated": 61, "mono_unsaturated": 35, "poly_unsaturated": 3 }, { "id": 10, "name": "Coconut Oil, 76 deg", "koh_sap": 0.257, "naoh_sap": 0.18319826590625565, "iodine": 10, "ins": 258, "lauric": 48, "myristic": 19, "palmitic": 9, "stearic": 3, "ricinoleic": 0, "oleic": 8, "linoleic": 2, "linolenic": 0, "hard": 79, "cleansing": 67, "bubbly": 67, "conditioning": 10, "creamy": 12, "saturated": 79, "mono_unsaturated": 8, "poly_unsaturated": 2 }, { "id": 72, "name": "Coconut Oil, 92 deg", "koh_sap": 0.257, "naoh_sap": 0.18319826590625565, "iodine": 3, "ins": 258, "lauric": 48, "myristic": 19, "palmitic": 9, "stearic": 3, "ricinoleic": 0, "oleic": 8, "linoleic": 2, "linolenic": 0, "hard": 79, "cleansing": 67, "bubbly": 67, "conditioning": 10, "creamy": 12, "saturated": 79, "mono_unsaturated": 8, "poly_unsaturated": 2 }, { "id": 65, "name": "Coconut Oil, fractionated", "koh_sap": 0.325, "naoh_sap": 0.23167095883086805, "iodine": 1, "ins": 324, "lauric": 2, "myristic": 1, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 100, "cleansing": 100, "bubbly": 100, "conditioning": 0, "creamy": 0, "saturated": 90, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 93, "name": "Coffee Bean Oil, green", "koh_sap": 0.185, "naoh_sap": 0.13187423810372487, "iodine": 85, "ins": 100, "lauric": 0, "myristic": 0, "palmitic": 38, "stearic": 8, "ricinoleic": 0, "oleic": 9, "linoleic": 39, "linolenic": 2, "hard": 46, "cleansing": 0, "bubbly": 0, "conditioning": 50, "creamy": 46, "saturated": 46, "mono_unsaturated": 9, "poly_unsaturated": 41 }, { "id": 74, "name": "Coffee Bean Oil, roasted", "koh_sap": 0.18, "naoh_sap": 0.1283100695063269, "iodine": 87, "ins": 93, "lauric": 0, "myristic": 0, "palmitic": 40, "stearic": 0, "ricinoleic": 0, "oleic": 8, "linoleic": 38, "linolenic": 2, "hard": 40, "cleansing": 0, "bubbly": 0, "conditioning": 48, "creamy": 40, "saturated": 40, "mono_unsaturated": 8, "poly_unsaturated": 40 }, { "id": 102, "name": "Cohune Oil", "koh_sap": 0.205, "naoh_sap": 0.14613091249331675, "iodine": 30, "ins": 175, "lauric": 51, "myristic": 13, "palmitic": 8, "stearic": 3, "ricinoleic": 0, "oleic": 18, "linoleic": 3, "linolenic": 0, "hard": 75, "cleansing": 64, "bubbly": 64, "conditioning": 21, "creamy": 11, "saturated": 75, "mono_unsaturated": 18, "poly_unsaturated": 3 }, { "id": 11, "name": "Corn Oil", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 117, "ins": 69, "lauric": 0, "myristic": 0, "palmitic": 12, "stearic": 2, "ricinoleic": 0, "oleic": 32, "linoleic": 51, "linolenic": 1, "hard": 14, "cleansing": 0, "bubbly": 0, "conditioning": 84, "creamy": 14, "saturated": 14, "mono_unsaturated": 32, "poly_unsaturated": 52 }, { "id": 12, "name": "Cottonseed Oil", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 108, "ins": 89, "lauric": 0, "myristic": 0, "palmitic": 13, "stearic": 13, "ricinoleic": 0, "oleic": 18, "linoleic": 52, "linolenic": 1, "hard": 26, "cleansing": 0, "bubbly": 0, "conditioning": 71, "creamy": 26, "saturated": 26, "mono_unsaturated": 18, "poly_unsaturated": 53 }, { "id": 92, "name": "Cranberry Seed Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 150, "ins": 40, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 23, "linoleic": 37, "linolenic": 32, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 92, "creamy": 8, "saturated": 8, "mono_unsaturated": 23, "poly_unsaturated": 69 }, { "id": 104, "name": "Crisco, new w/palm", "koh_sap": 0.193, "naoh_sap": 0.13757690785956164, "iodine": 111, "ins": 82, "lauric": 0, "myristic": 0, "palmitic": 20, "stearic": 5, "ricinoleic": 0, "oleic": 28, "linoleic": 40, "linolenic": 6, "hard": 25, "cleansing": 0, "bubbly": 0, "conditioning": 74, "creamy": 25, "saturated": 25, "mono_unsaturated": 28, "poly_unsaturated": 46 }, { "id": 13, "name": "Crisco, old", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 93, "ins": 115, "lauric": 0, "myristic": 0, "palmitic": 13, "stearic": 13, "ricinoleic": 0, "oleic": 18, "linoleic": 52, "linolenic": 0, "hard": 26, "cleansing": 0, "bubbly": 0, "conditioning": 70, "creamy": 26, "saturated": 26, "mono_unsaturated": 18, "poly_unsaturated": 52 }, { "id": 101, "name": "Cupuacu Butter", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 39, "ins": 153, "lauric": 0, "myristic": 0, "palmitic": 8, "stearic": 35, "ricinoleic": 0, "oleic": 42, "linoleic": 2, "linolenic": 0, "hard": 54, "cleansing": 0, "bubbly": 0, "conditioning": 44, "creamy": 43, "saturated": 54, "mono_unsaturated": 42, "poly_unsaturated": 2 }, { "id": 87, "name": "Duck Fat, flesh and skin", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 72, "ins": 122, "lauric": 0, "myristic": 1, "palmitic": 26, "stearic": 9, "ricinoleic": 0, "oleic": 44, "linoleic": 13, "linolenic": 1, "hard": 36, "cleansing": 1, "bubbly": 1, "conditioning": 58, "creamy": 35, "saturated": 36, "mono_unsaturated": 44, "poly_unsaturated": 14 }, { "id": 14, "name": "Emu Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 60, "ins": 128, "lauric": 0, "myristic": 0, "palmitic": 23, "stearic": 9, "ricinoleic": 0, "oleic": 47, "linoleic": 8, "linolenic": 0, "hard": 32, "cleansing": 0, "bubbly": 0, "conditioning": 55, "creamy": 32, "saturated": 32, "mono_unsaturated": 47, "poly_unsaturated": 8 }, { "id": 15, "name": "Evening Primrose Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 160, "ins": 30, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 80, "linolenic": 9, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 89, "creamy": 0, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 89 }, { "id": 16, "name": "Flax Oil, linseed", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 180, "ins": -6, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 3, "ricinoleic": 0, "oleic": 27, "linoleic": 13, "linolenic": 50, "hard": 9, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 9, "saturated": 9, "mono_unsaturated": 27, "poly_unsaturated": 63 }, { "id": 95, "name": "Ghee, any bovine", "koh_sap": 0.227, "naoh_sap": 0.16181325432186783, "iodine": 30, "ins": 191, "lauric": 4, "myristic": 11, "palmitic": 28, "stearic": 12, "ricinoleic": 0, "oleic": 19, "linoleic": 2, "linolenic": 1, "hard": 55, "cleansing": 15, "bubbly": 15, "conditioning": 22, "creamy": 40, "saturated": 55, "mono_unsaturated": 19, "poly_unsaturated": 3 }, { "id": 17, "name": "Goose Fat", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 65, "ins": 130, "lauric": 0, "myristic": 0, "palmitic": 21, "stearic": 6, "ricinoleic": 0, "oleic": 54, "linoleic": 10, "linolenic": 0, "hard": 27, "cleansing": 0, "bubbly": 0, "conditioning": 64, "creamy": 27, "saturated": 27, "mono_unsaturated": 54, "poly_unsaturated": 10 }, { "id": 18, "name": "Grapeseed Oil", "koh_sap": 0.181, "naoh_sap": 0.1290229032258065, "iodine": 131, "ins": 66, "lauric": 0, "myristic": 0, "palmitic": 8, "stearic": 4, "ricinoleic": 0, "oleic": 20, "linoleic": 68, "linolenic": 0, "hard": 12, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 12, "saturated": 12, "mono_unsaturated": 20, "poly_unsaturated": 68 }, { "id": 19, "name": "Hazelnut Oil", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 97, "ins": 94, "lauric": 0, "myristic": 0, "palmitic": 5, "stearic": 3, "ricinoleic": 0, "oleic": 75, "linoleic": 10, "linolenic": 0, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 85, "creamy": 8, "saturated": 8, "mono_unsaturated": 75, "poly_unsaturated": 10 }, { "id": 20, "name": "Hemp Oil", "koh_sap": 0.193, "naoh_sap": 0.13757690785956164, "iodine": 165, "ins": 39, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 12, "linoleic": 57, "linolenic": 21, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 8, "saturated": 8, "mono_unsaturated": 12, "poly_unsaturated": 78 }, { "id": 94, "name": "Horse Oil", "koh_sap": 0.196, "naoh_sap": 0.13971540901800042, "iodine": 79, "ins": 117, "lauric": 0, "myristic": 3, "palmitic": 26, "stearic": 5, "ricinoleic": 0, "oleic": 10, "linoleic": 20, "linolenic": 19, "hard": 34, "cleansing": 3, "bubbly": 3, "conditioning": 49, "creamy": 31, "saturated": 34, "mono_unsaturated": 10, "poly_unsaturated": 39 }, { "id": 62, "name": "Illipe Butter", "koh_sap": 0.185, "naoh_sap": 0.13187423810372487, "iodine": 33, "ins": 152, "lauric": 0, "myristic": 0, "palmitic": 17, "stearic": 45, "ricinoleic": 0, "oleic": 35, "linoleic": 0, "linolenic": 0, "hard": 62, "cleansing": 0, "bubbly": 0, "conditioning": 35, "creamy": 62, "saturated": 62, "mono_unsaturated": 35, "poly_unsaturated": 0 }, { "id": 143, "name": "Japan Wax", "koh_sap": 0.215, "naoh_sap": 0.1532592496881127, "iodine": 11, "ins": 204, "lauric": 0, "myristic": 1, "palmitic": 80, "stearic": 7, "ricinoleic": 0, "oleic": 4, "linoleic": 0, "linolenic": 0, "hard": 88, "cleansing": 1, "bubbly": 1, "conditioning": 4, "creamy": 87, "saturated": 88, "mono_unsaturated": 4, "poly_unsaturated": 0 }, { "id": 108, "name": "Jatropha Oil, soapnut seed oil", "koh_sap": 0.193, "naoh_sap": 0.13757690785956164, "iodine": 102, "ins": 91, "lauric": 0, "myristic": 0, "palmitic": 9, "stearic": 7, "ricinoleic": 0, "oleic": 44, "linoleic": 34, "linolenic": 0, "hard": 16, "cleansing": 0, "bubbly": 0, "conditioning": 78, "creamy": 16, "saturated": 16, "mono_unsaturated": 44, "poly_unsaturated": 34 }, { "id": 21, "name": "Jojoba Oil (a Liquid Wax Ester)", "koh_sap": 0.092, "naoh_sap": 0.06558070219212264, "iodine": 83, "ins": 11, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 12, "linoleic": 0, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 12, "creamy": 0, "saturated": 0, "mono_unsaturated": 12, "poly_unsaturated": 0 }, { "id": 51, "name": "Karanja Oil", "koh_sap": 0.183, "naoh_sap": 0.1304485706647657, "iodine": 85, "ins": 98, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 6, "ricinoleic": 0, "oleic": 58, "linoleic": 15, "linolenic": 0, "hard": 12, "cleansing": 0, "bubbly": 0, "conditioning": 73, "creamy": 12, "saturated": 12, "mono_unsaturated": 58, "poly_unsaturated": 15 }, { "id": 23, "name": "Kokum Butter", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 35, "ins": 155, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 56, "ricinoleic": 0, "oleic": 36, "linoleic": 1, "linolenic": 0, "hard": 60, "cleansing": 0, "bubbly": 0, "conditioning": 37, "creamy": 60, "saturated": 60, "mono_unsaturated": 36, "poly_unsaturated": 1 }, { "id": 86, "name": "Kpangnan Butter", "koh_sap": 0.191, "naoh_sap": 0.13615124042060245, "iodine": 42, "ins": 149, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 44, "ricinoleic": 0, "oleic": 49, "linoleic": 1, "linolenic": 0, "hard": 50, "cleansing": 0, "bubbly": 0, "conditioning": 50, "creamy": 50, "saturated": 50, "mono_unsaturated": 49, "poly_unsaturated": 1 }, { "id": 24, "name": "Kukui nut Oil", "koh_sap": 0.189, "naoh_sap": 0.13472557298164325, "iodine": 168, "ins": 24, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 20, "linoleic": 42, "linolenic": 29, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 91, "creamy": 8, "saturated": 8, "mono_unsaturated": 20, "poly_unsaturated": 71 }, { "id": 25, "name": "Lanolin liquid Wax", "koh_sap": 0.106, "naoh_sap": 0.07556037426483696, "iodine": 27, "ins": 83, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 0, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 26, "name": "Lard, Pig Tallow (Manteca)", "koh_sap": 0.198, "naoh_sap": 0.1411410764569596, "iodine": 57, "ins": 139, "lauric": 0, "myristic": 1, "palmitic": 28, "stearic": 13, "ricinoleic": 0, "oleic": 46, "linoleic": 6, "linolenic": 0, "hard": 42, "cleansing": 1, "bubbly": 1, "conditioning": 52, "creamy": 41, "saturated": 42, "mono_unsaturated": 46, "poly_unsaturated": 6 }, { "id": 127, "name": "Laurel Fruit Oil", "koh_sap": 0.198, "naoh_sap": 0.1411410764569596, "iodine": 74, "ins": 124, "lauric": 25, "myristic": 1, "palmitic": 15, "stearic": 1, "ricinoleic": 0, "oleic": 31, "linoleic": 26, "linolenic": 1, "hard": 42, "cleansing": 26, "bubbly": 26, "conditioning": 58, "creamy": 16, "saturated": 42, "mono_unsaturated": 31, "poly_unsaturated": 27 }, { "id": 125, "name": "Lauric Acid", "koh_sap": 0.28, "naoh_sap": 0.1995934414542863, "iodine": 0, "ins": 280, "lauric": 99, "myristic": 1, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 100, "cleansing": 100, "bubbly": 100, "conditioning": 0, "creamy": 0, "saturated": 100, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 27, "name": "Linseed Oil, flax", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 180, "ins": -6, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 3, "ricinoleic": 0, "oleic": 27, "linoleic": 13, "linolenic": 50, "hard": 9, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 9, "saturated": 9, "mono_unsaturated": 27, "poly_unsaturated": 63 }, { "id": 119, "name": "Loofa Seed Oil, Luffa cylinderica", "koh_sap": 0.187, "naoh_sap": 0.13329990554268406, "iodine": 108, "ins": 79, "lauric": 0, "myristic": 0, "palmitic": 9, "stearic": 18, "ricinoleic": 0, "oleic": 30, "linoleic": 47, "linolenic": 0, "hard": 27, "cleansing": 0, "bubbly": 0, "conditioning": 77, "creamy": 27, "saturated": 27, "mono_unsaturated": 30, "poly_unsaturated": 47 }, { "id": 124, "name": "Macadamia Nut Butter", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 70, "ins": 118, "lauric": 0, "myristic": 1, "palmitic": 6, "stearic": 12, "ricinoleic": 0, "oleic": 56, "linoleic": 3, "linolenic": 1, "hard": 19, "cleansing": 1, "bubbly": 1, "conditioning": 60, "creamy": 18, "saturated": 19, "mono_unsaturated": 56, "poly_unsaturated": 4 }, { "id": 28, "name": "Macadamia Nut Oil", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 76, "ins": 119, "lauric": 0, "myristic": 0, "palmitic": 9, "stearic": 5, "ricinoleic": 0, "oleic": 59, "linoleic": 2, "linolenic": 0, "hard": 14, "cleansing": 0, "bubbly": 0, "conditioning": 61, "creamy": 14, "saturated": 14, "mono_unsaturated": 59, "poly_unsaturated": 2 }, { "id": 141, "name": "Mafura Butter, Trichilia emetica ", "koh_sap": 0.198, "naoh_sap": 0.1411410764569596, "iodine": 66, "ins": 132, "lauric": 0, "myristic": 1, "palmitic": 37, "stearic": 3, "ricinoleic": 0, "oleic": 49, "linoleic": 11, "linolenic": 1, "hard": 41, "cleansing": 1, "bubbly": 1, "conditioning": 61, "creamy": 40, "saturated": 41, "mono_unsaturated": 49, "poly_unsaturated": 12 }, { "id": 29, "name": "Mango Seed Butter", "koh_sap": 0.191, "naoh_sap": 0.13615124042060245, "iodine": 45, "ins": 146, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 42, "ricinoleic": 0, "oleic": 45, "linoleic": 3, "linolenic": 0, "hard": 49, "cleansing": 0, "bubbly": 0, "conditioning": 48, "creamy": 49, "saturated": 49, "mono_unsaturated": 45, "poly_unsaturated": 3 }, { "id": 30, "name": "Mango Seed Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 60, "ins": 130, "lauric": 0, "myristic": 0, "palmitic": 8, "stearic": 27, "ricinoleic": 0, "oleic": 52, "linoleic": 8, "linolenic": 1, "hard": 35, "cleansing": 0, "bubbly": 0, "conditioning": 61, "creamy": 35, "saturated": 35, "mono_unsaturated": 52, "poly_unsaturated": 9 }, { "id": 99, "name": "Marula Oil", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 73, "ins": 119, "lauric": 0, "myristic": 0, "palmitic": 11, "stearic": 7, "ricinoleic": 0, "oleic": 75, "linoleic": 4, "linolenic": 0, "hard": 18, "cleansing": 0, "bubbly": 0, "conditioning": 79, "creamy": 18, "saturated": 18, "mono_unsaturated": 75, "poly_unsaturated": 4 }, { "id": 31, "name": "Meadowfoam Oil", "koh_sap": 0.169, "naoh_sap": 0.12046889859205138, "iodine": 92, "ins": 77, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 2, "cleansing": 0, "bubbly": 0, "conditioning": 98, "creamy": 2, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 100 }, { "id": 32, "name": "Milk Fat, any bovine", "koh_sap": 0.227, "naoh_sap": 0.16181325432186783, "iodine": 30, "ins": 191, "lauric": 4, "myristic": 11, "palmitic": 28, "stearic": 12, "ricinoleic": 0, "oleic": 19, "linoleic": 2, "linolenic": 1, "hard": 55, "cleansing": 15, "bubbly": 15, "conditioning": 22, "creamy": 40, "saturated": 55, "mono_unsaturated": 19, "poly_unsaturated": 3 }, { "id": 130, "name": "Milk Thistle Oil", "koh_sap": 0.196, "naoh_sap": 0.13971540901800042, "iodine": 115, "ins": 81, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 2, "ricinoleic": 0, "oleic": 26, "linoleic": 64, "linolenic": 0, "hard": 9, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 9, "saturated": 9, "mono_unsaturated": 26, "poly_unsaturated": 64 }, { "id": 67, "name": "Mink Oil", "koh_sap": 0.196, "naoh_sap": 0.13971540901800042, "iodine": 55, "ins": 141, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 0, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 69, "name": "Monoi de Tahiti  Oil", "koh_sap": 0.255, "naoh_sap": 0.18177259846729646, "iodine": 9, "ins": 246, "lauric": 44, "myristic": 16, "palmitic": 10, "stearic": 3, "ricinoleic": 0, "oleic": 0, "linoleic": 2, "linolenic": 0, "hard": 73, "cleansing": 60, "bubbly": 60, "conditioning": 2, "creamy": 13, "saturated": 73, "mono_unsaturated": 0, "poly_unsaturated": 2 }, { "id": 109, "name": "Moringa Oil", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 68, "ins": 124, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 7, "ricinoleic": 0, "oleic": 71, "linoleic": 2, "linolenic": 0, "hard": 14, "cleansing": 0, "bubbly": 0, "conditioning": 73, "creamy": 14, "saturated": 14, "mono_unsaturated": 71, "poly_unsaturated": 2 }, { "id": 63, "name": "Mowrah Butter", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 62, "ins": 132, "lauric": 0, "myristic": 0, "palmitic": 24, "stearic": 22, "ricinoleic": 0, "oleic": 36, "linoleic": 15, "linolenic": 0, "hard": 46, "cleansing": 0, "bubbly": 0, "conditioning": 51, "creamy": 46, "saturated": 46, "mono_unsaturated": 36, "poly_unsaturated": 15 }, { "id": 106, "name": "Murumuru Butter", "koh_sap": 0.275, "naoh_sap": 0.19602927285688834, "iodine": 25, "ins": 250, "lauric": 47, "myristic": 26, "palmitic": 6, "stearic": 3, "ricinoleic": 0, "oleic": 15, "linoleic": 3, "linolenic": 0, "hard": 82, "cleansing": 73, "bubbly": 73, "conditioning": 18, "creamy": 9, "saturated": 82, "mono_unsaturated": 15, "poly_unsaturated": 3 }, { "id": 103, "name": "Mustard Oil, kachi ghani", "koh_sap": 0.173, "naoh_sap": 0.12332023346996974, "iodine": 101, "ins": 72, "lauric": 0, "myristic": 0, "palmitic": 2, "stearic": 2, "ricinoleic": 0, "oleic": 18, "linoleic": 14, "linolenic": 9, "hard": 4, "cleansing": 0, "bubbly": 0, "conditioning": 41, "creamy": 4, "saturated": 4, "mono_unsaturated": 18, "poly_unsaturated": 23 }, { "id": 76, "name": "Myristic Acid", "koh_sap": 0.247, "naoh_sap": 0.1760699287114597, "iodine": 1, "ins": 246, "lauric": 0, "myristic": 99, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 99, "cleansing": 99, "bubbly": 99, "conditioning": 0, "creamy": 0, "saturated": 99, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 121, "name": "Neatsfoot Oil", "koh_sap": 0.18, "naoh_sap": 0.1283100695063269, "iodine": 90, "ins": 90, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 0, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 33, "name": "Neem Seed Oil", "koh_sap": 0.193, "naoh_sap": 0.13757690785956164, "iodine": 72, "ins": 121, "lauric": 0, "myristic": 2, "palmitic": 21, "stearic": 16, "ricinoleic": 0, "oleic": 46, "linoleic": 12, "linolenic": 0, "hard": 39, "cleansing": 2, "bubbly": 2, "conditioning": 58, "creamy": 37, "saturated": 39, "mono_unsaturated": 46, "poly_unsaturated": 12 }, { "id": 139, "name": "Nutmeg Butter", "koh_sap": 0.1624, "naoh_sap": 0.11576419604348605, "iodine": 46, "ins": 116, "lauric": 3, "myristic": 83, "palmitic": 4, "stearic": 0, "ricinoleic": 0, "oleic": 5, "linoleic": 0, "linolenic": 0, "hard": 90, "cleansing": 86, "bubbly": 86, "conditioning": 5, "creamy": 4, "saturated": 90, "mono_unsaturated": 5, "poly_unsaturated": 0 }, { "id": 117, "name": "Oat Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 104, "ins": 86, "lauric": 0, "myristic": 0, "palmitic": 15, "stearic": 2, "ricinoleic": 0, "oleic": 40, "linoleic": 39, "linolenic": 0, "hard": 17, "cleansing": 0, "bubbly": 0, "conditioning": 79, "creamy": 17, "saturated": 17, "mono_unsaturated": 40, "poly_unsaturated": 39 }, { "id": 88, "name": "Oleic Acid", "koh_sap": 0.202, "naoh_sap": 0.143992411334878, "iodine": 92, "ins": 110, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 99, "linoleic": 0, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 99, "creamy": 0, "saturated": 0, "mono_unsaturated": 99, "poly_unsaturated": 0 }, { "id": 34, "name": "Olive Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 85, "ins": 105, "lauric": 0, "myristic": 0, "palmitic": 14, "stearic": 3, "ricinoleic": 0, "oleic": 69, "linoleic": 12, "linolenic": 1, "hard": 17, "cleansing": 0, "bubbly": 0, "conditioning": 82, "creamy": 17, "saturated": 17, "mono_unsaturated": 69, "poly_unsaturated": 13 }, { "id": 52, "name": "Olive Oil  pomace", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 84, "ins": 104, "lauric": 0, "myristic": 0, "palmitic": 14, "stearic": 3, "ricinoleic": 0, "oleic": 69, "linoleic": 12, "linolenic": 2, "hard": 17, "cleansing": 0, "bubbly": 0, "conditioning": 83, "creamy": 17, "saturated": 17, "mono_unsaturated": 69, "poly_unsaturated": 14 }, { "id": 82, "name": "Ostrich Oil", "koh_sap": 0.1946, "naoh_sap": 0.13871744181072898, "iodine": 97, "ins": 128, "lauric": 3, "myristic": 1, "palmitic": 26, "stearic": 6, "ricinoleic": 0, "oleic": 37, "linoleic": 17, "linolenic": 3, "hard": 36, "cleansing": 4, "bubbly": 4, "conditioning": 57, "creamy": 32, "saturated": 36, "mono_unsaturated": 37, "poly_unsaturated": 20 }, { "id": 35, "name": "Palm Kernel Oil", "koh_sap": 0.247, "naoh_sap": 0.1760699287114597, "iodine": 20, "ins": 227, "lauric": 49, "myristic": 16, "palmitic": 8, "stearic": 2, "ricinoleic": 0, "oleic": 15, "linoleic": 3, "linolenic": 0, "hard": 75, "cleansing": 65, "bubbly": 65, "conditioning": 18, "creamy": 10, "saturated": 75, "mono_unsaturated": 15, "poly_unsaturated": 3 }, { "id": 126, "name": "Palm Kernel Oil Flakes, hydrogenated", "koh_sap": 0.247, "naoh_sap": 0.1760699287114597, "iodine": 20, "ins": 227, "lauric": 49, "myristic": 17, "palmitic": 8, "stearic": 16, "ricinoleic": 0, "oleic": 4, "linoleic": 0, "linolenic": 0, "hard": 90, "cleansing": 66, "bubbly": 66, "conditioning": 4, "creamy": 24, "saturated": 90, "mono_unsaturated": 4, "poly_unsaturated": 0 }, { "id": 36, "name": "Palm Oil", "koh_sap": 0.199, "naoh_sap": 0.1418539101764392, "iodine": 53, "ins": 145, "lauric": 0, "myristic": 1, "palmitic": 44, "stearic": 5, "ricinoleic": 0, "oleic": 39, "linoleic": 10, "linolenic": 0, "hard": 50, "cleansing": 1, "bubbly": 1, "conditioning": 49, "creamy": 49, "saturated": 50, "mono_unsaturated": 39, "poly_unsaturated": 10 }, { "id": 113, "name": "Palm Stearin", "koh_sap": 0.199, "naoh_sap": 0.1418539101764392, "iodine": 48, "ins": 151, "lauric": 0, "myristic": 2, "palmitic": 60, "stearic": 5, "ricinoleic": 0, "oleic": 26, "linoleic": 7, "linolenic": 0, "hard": 67, "cleansing": 2, "bubbly": 2, "conditioning": 33, "creamy": 65, "saturated": 67, "mono_unsaturated": 26, "poly_unsaturated": 7 }, { "id": 77, "name": "Palmitic Acid", "koh_sap": 0.215, "naoh_sap": 0.1532592496881127, "iodine": 2, "ins": 213, "lauric": 0, "myristic": 0, "palmitic": 98, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 98, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 98, "saturated": 98, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 131, "name": "Palmolein", "koh_sap": 0.2, "naoh_sap": 0.1425667438959188, "iodine": 58, "ins": 142, "lauric": 0, "myristic": 1, "palmitic": 40, "stearic": 5, "ricinoleic": 0, "oleic": 43, "linoleic": 11, "linolenic": 0, "hard": 46, "cleansing": 1, "bubbly": 1, "conditioning": 54, "creamy": 45, "saturated": 46, "mono_unsaturated": 43, "poly_unsaturated": 11 }, { "id": 120, "name": "Papaya seed oil, Carica papaya", "koh_sap": 0.158, "naoh_sap": 0.11262772767777585, "iodine": 67, "ins": 91, "lauric": 0, "myristic": 0, "palmitic": 13, "stearic": 5, "ricinoleic": 0, "oleic": 76, "linoleic": 3, "linolenic": 0, "hard": 18, "cleansing": 0, "bubbly": 0, "conditioning": 79, "creamy": 18, "saturated": 18, "mono_unsaturated": 76, "poly_unsaturated": 3 }, { "id": 37, "name": "Passion Fruit Seed Oil", "koh_sap": 0.183, "naoh_sap": 0.1304485706647657, "iodine": 136, "ins": 47, "lauric": 0, "myristic": 0, "palmitic": 10, "stearic": 3, "ricinoleic": 0, "oleic": 15, "linoleic": 70, "linolenic": 1, "hard": 13, "cleansing": 0, "bubbly": 0, "conditioning": 86, "creamy": 13, "saturated": 13, "mono_unsaturated": 15, "poly_unsaturated": 71 }, { "id": 148, "name": "Pataua (Patawa) Oil", "koh_sap": 0.2, "naoh_sap": 0.1425667438959188, "iodine": 77, "ins": 123, "lauric": 0, "myristic": 0, "palmitic": 13, "stearic": 4, "ricinoleic": 0, "oleic": 78, "linoleic": 3, "linolenic": 1, "hard": 17, "cleansing": 0, "bubbly": 0, "conditioning": 82, "creamy": 17, "saturated": 17, "mono_unsaturated": 78, "poly_unsaturated": 4 }, { "id": 70, "name": "Peach Kernel Oil", "koh_sap": 0.191, "naoh_sap": 0.13615124042060245, "iodine": 108, "ins": 87, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 65, "linoleic": 25, "linolenic": 1, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 91, "creamy": 8, "saturated": 8, "mono_unsaturated": 65, "poly_unsaturated": 26 }, { "id": 38, "name": "Peanut Oil", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 92, "ins": 99, "lauric": 0, "myristic": 0, "palmitic": 8, "stearic": 3, "ricinoleic": 0, "oleic": 56, "linoleic": 26, "linolenic": 0, "hard": 11, "cleansing": 0, "bubbly": 0, "conditioning": 82, "creamy": 11, "saturated": 11, "mono_unsaturated": 56, "poly_unsaturated": 26 }, { "id": 137, "name": "Pecan Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 113, "ins": 77, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 2, "ricinoleic": 0, "oleic": 50, "linoleic": 39, "linolenic": 2, "hard": 9, "cleansing": 0, "bubbly": 0, "conditioning": 91, "creamy": 9, "saturated": 9, "mono_unsaturated": 50, "poly_unsaturated": 41 }, { "id": 75, "name": "Perilla Seed Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 196, "ins": -6, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 2, "ricinoleic": 0, "oleic": 15, "linoleic": 16, "linolenic": 56, "hard": 8, "cleansing": 0, "bubbly": 0, "conditioning": 87, "creamy": 8, "saturated": 8, "mono_unsaturated": 15, "poly_unsaturated": 72 }, { "id": 85, "name": "Pine Tar, lye calc only no FA", "koh_sap": 0.06, "naoh_sap": 0.04277002316877564, "iodine": 0, "ins": 0, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 0, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 0, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 0, "saturated": 0, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 39, "name": "Pistachio Oil", "koh_sap": 0.186, "naoh_sap": 0.13258707182320448, "iodine": 95, "ins": 92, "lauric": 0, "myristic": 0, "palmitic": 11, "stearic": 1, "ricinoleic": 0, "oleic": 63, "linoleic": 25, "linolenic": 0, "hard": 12, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 12, "saturated": 12, "mono_unsaturated": 63, "poly_unsaturated": 25 }, { "id": 107, "name": "Plum Kernel Oil", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 98, "ins": 96, "lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 0, "ricinoleic": 0, "oleic": 68, "linoleic": 23, "linolenic": 0, "hard": 3, "cleansing": 0, "bubbly": 0, "conditioning": 91, "creamy": 3, "saturated": 3, "mono_unsaturated": 68, "poly_unsaturated": 23 }, { "id": 128, "name": "Pomegranate Seed Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 22, "ins": 168, "lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 3, "ricinoleic": 0, "oleic": 7, "linoleic": 7, "linolenic": 78, "hard": 6, "cleansing": 0, "bubbly": 0, "conditioning": 92, "creamy": 6, "saturated": 6, "mono_unsaturated": 7, "poly_unsaturated": 85 }, { "id": 73, "name": "Poppy Seed Oil", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 140, "ins": 54, "lauric": 0, "myristic": 0, "palmitic": 10, "stearic": 2, "ricinoleic": 0, "oleic": 17, "linoleic": 69, "linolenic": 2, "hard": 12, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 12, "saturated": 12, "mono_unsaturated": 17, "poly_unsaturated": 71 }, { "id": 149, "name": "Pracaxi (Pracachy) Seed Oil - hair conditioner", "koh_sap": 0.175, "naoh_sap": 0.12474590090892894, "iodine": 68, "ins": 107, "lauric": 1, "myristic": 1, "palmitic": 2, "stearic": 2, "ricinoleic": 0, "oleic": 44, "linoleic": 2, "linolenic": 2, "hard": 6, "cleansing": 2, "bubbly": 2, "conditioning": 83, "creamy": 4, "saturated": 54, "mono_unsaturated": 42, "poly_unsaturated": 2 }, { "id": 83, "name": "Pumpkin Seed Oil virgin", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 128, "ins": 67, "lauric": 0, "myristic": 0, "palmitic": 11, "stearic": 8, "ricinoleic": 0, "oleic": 33, "linoleic": 50, "linolenic": 0, "hard": 19, "cleansing": 0, "bubbly": 0, "conditioning": 83, "creamy": 19, "saturated": 19, "mono_unsaturated": 33, "poly_unsaturated": 50 }, { "id": 91, "name": "Rabbit Fat", "koh_sap": 0.201, "naoh_sap": 0.1432795776153984, "iodine": 85, "ins": 116, "lauric": 0, "myristic": 3, "palmitic": 30, "stearic": 6, "ricinoleic": 0, "oleic": 30, "linoleic": 20, "linolenic": 5, "hard": 39, "cleansing": 3, "bubbly": 3, "conditioning": 55, "creamy": 36, "saturated": 39, "mono_unsaturated": 30, "poly_unsaturated": 25 }, { "id": 40, "name": "Rapeseed Oil, unrefined canola", "koh_sap": 0.175, "naoh_sap": 0.12474590090892894, "iodine": 106, "ins": 69, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 1, "ricinoleic": 0, "oleic": 17, "linoleic": 13, "linolenic": 9, "hard": 5, "cleansing": 0, "bubbly": 0, "conditioning": 95, "creamy": 1, "saturated": 7, "mono_unsaturated": 68, "poly_unsaturated": 25 }, { "id": 129, "name": "Raspberry Seed Oil", "koh_sap": 0.187, "naoh_sap": 0.13329990554268406, "iodine": 163, "ins": 24, "lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 0, "ricinoleic": 0, "oleic": 13, "linoleic": 55, "linolenic": 26, "hard": 3, "cleansing": 0, "bubbly": 0, "conditioning": 94, "creamy": 3, "saturated": 3, "mono_unsaturated": 13, "poly_unsaturated": 81 }, { "id": 89, "name": "Red Palm Butter", "koh_sap": 0.199, "naoh_sap": 0.1418539101764392, "iodine": 53, "ins": 145, "lauric": 0, "myristic": 1, "palmitic": 44, "stearic": 5, "ricinoleic": 0, "oleic": 39, "linoleic": 10, "linolenic": 0, "hard": 50, "cleansing": 1, "bubbly": 1, "conditioning": 49, "creamy": 49, "saturated": 50, "mono_unsaturated": 39, "poly_unsaturated": 10 }, { "id": 41, "name": "Rice Bran Oil, refined", "koh_sap": 0.187, "naoh_sap": 0.13329990554268406, "iodine": 100, "ins": 87, "lauric": 0, "myristic": 1, "palmitic": 22, "stearic": 3, "ricinoleic": 0, "oleic": 38, "linoleic": 34, "linolenic": 2, "hard": 26, "cleansing": 1, "bubbly": 1, "conditioning": 74, "creamy": 25, "saturated": 26, "mono_unsaturated": 38, "poly_unsaturated": 36 }, { "id": 61, "name": "Rosehip Oil", "koh_sap": 0.187, "naoh_sap": 0.13329990554268406, "iodine": 188, "ins": 10, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 2, "ricinoleic": 0, "oleic": 12, "linoleic": 46, "linolenic": 31, "hard": 6, "cleansing": 0, "bubbly": 0, "conditioning": 89, "creamy": 6, "saturated": 6, "mono_unsaturated": 12, "poly_unsaturated": 77 }, { "id": 122, "name": "Sacha Inchi, Plukenetia volubilis", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 141, "ins": 47, "lauric": 0, "myristic": 0, "palmitic": 4, "stearic": 3, "ricinoleic": 0, "oleic": 10, "linoleic": 35, "linolenic": 48, "hard": 7, "cleansing": 0, "bubbly": 0, "conditioning": 93, "creamy": 7, "saturated": 7, "mono_unsaturated": 10, "poly_unsaturated": 83 }, { "id": 42, "name": "Safflower Oil", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 145, "ins": 47, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 0, "ricinoleic": 0, "oleic": 15, "linoleic": 75, "linolenic": 0, "hard": 7, "cleansing": 0, "bubbly": 0, "conditioning": 90, "creamy": 7, "saturated": 7, "mono_unsaturated": 15, "poly_unsaturated": 75 }, { "id": 78, "name": "Safflower Oil, high oleic", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 93, "ins": 97, "lauric": 0, "myristic": 0, "palmitic": 5, "stearic": 2, "ricinoleic": 0, "oleic": 77, "linoleic": 15, "linolenic": 0, "hard": 7, "cleansing": 0, "bubbly": 0, "conditioning": 92, "creamy": 7, "saturated": 7, "mono_unsaturated": 77, "poly_unsaturated": 15 }, { "id": 64, "name": "Sal Butter", "koh_sap": 0.185, "naoh_sap": 0.13187423810372487, "iodine": 39, "ins": 146, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 44, "ricinoleic": 0, "oleic": 40, "linoleic": 2, "linolenic": 0, "hard": 50, "cleansing": 0, "bubbly": 0, "conditioning": 42, "creamy": 50, "saturated": 50, "mono_unsaturated": 40, "poly_unsaturated": 2 }, { "id": 140, "name": "Salmon Oil", "koh_sap": 0.185, "naoh_sap": 0.13187423810372487, "iodine": 169, "ins": 16, "lauric": 0, "myristic": 5, "palmitic": 19, "stearic": 2, "ricinoleic": 0, "oleic": 23, "linoleic": 2, "linolenic": 1, "hard": 28, "cleansing": 0, "bubbly": 0, "conditioning": 72, "creamy": 3, "saturated": 28, "mono_unsaturated": 32, "poly_unsaturated": 40 }, { "id": 111, "name": "Saw Palmetto Extract", "koh_sap": 0.23, "naoh_sap": 0.1639517554803066, "iodine": 45, "ins": 185, "lauric": 29, "myristic": 11, "palmitic": 8, "stearic": 2, "ricinoleic": 0, "oleic": 35, "linoleic": 4, "linolenic": 1, "hard": 50, "cleansing": 40, "bubbly": 40, "conditioning": 40, "creamy": 10, "saturated": 50, "mono_unsaturated": 35, "poly_unsaturated": 5 }, { "id": 110, "name": "Saw Palmetto Oil", "koh_sap": 0.22, "naoh_sap": 0.15682341828551066, "iodine": 44, "ins": 176, "lauric": 29, "myristic": 13, "palmitic": 9, "stearic": 2, "ricinoleic": 0, "oleic": 31, "linoleic": 4, "linolenic": 1, "hard": 53, "cleansing": 42, "bubbly": 42, "conditioning": 36, "creamy": 11, "saturated": 53, "mono_unsaturated": 31, "poly_unsaturated": 5 }, { "id": 116, "name": "Sea Buckthorn Oil, seed", "koh_sap": 0.195, "naoh_sap": 0.13900257529852084, "iodine": 165, "ins": 30, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 3, "ricinoleic": 0, "oleic": 14, "linoleic": 36, "linolenic": 38, "hard": 10, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 10, "saturated": 10, "mono_unsaturated": 14, "poly_unsaturated": 74 }, { "id": 115, "name": "Sea Buckthorn Oil, seed and berry", "koh_sap": 0.183, "naoh_sap": 0.1304485706647657, "iodine": 86, "ins": 97, "lauric": 0, "myristic": 0, "palmitic": 30, "stearic": 1, "ricinoleic": 0, "oleic": 28, "linoleic": 10, "linolenic": 0, "hard": 31, "cleansing": 0, "bubbly": 0, "conditioning": 38, "creamy": 31, "saturated": 31, "mono_unsaturated": 28, "poly_unsaturated": 10 }, { "id": 43, "name": "Sesame Oil", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 110, "ins": 81, "lauric": 0, "myristic": 0, "palmitic": 10, "stearic": 5, "ricinoleic": 0, "oleic": 40, "linoleic": 43, "linolenic": 0, "hard": 15, "cleansing": 0, "bubbly": 0, "conditioning": 83, "creamy": 15, "saturated": 15, "mono_unsaturated": 40, "poly_unsaturated": 43 }, { "id": 44, "name": "Shea Butter", "koh_sap": 0.179, "naoh_sap": 0.1275972357868473, "iodine": 59, "ins": 116, "lauric": 0, "myristic": 0, "palmitic": 5, "stearic": 40, "ricinoleic": 0, "oleic": 48, "linoleic": 6, "linolenic": 0, "hard": 45, "cleansing": 0, "bubbly": 0, "conditioning": 54, "creamy": 45, "saturated": 45, "mono_unsaturated": 48, "poly_unsaturated": 6 }, { "id": 22, "name": "Shea Oil, fractionated", "koh_sap": 0.185, "naoh_sap": 0.13187423810372487, "iodine": 83, "ins": 102, "lauric": 0, "myristic": 0, "palmitic": 6, "stearic": 10, "ricinoleic": 0, "oleic": 73, "linoleic": 11, "linolenic": 0, "hard": 16, "cleansing": 0, "bubbly": 0, "conditioning": 84, "creamy": 16, "saturated": 16, "mono_unsaturated": 73, "poly_unsaturated": 11 }, { "id": 133, "name": "SoapQuick, conventional", "koh_sap": 0.212, "naoh_sap": 0.15112074852967392, "iodine": 59, "ins": 153, "lauric": 13, "myristic": 6, "palmitic": 17, "stearic": 3, "ricinoleic": 5, "oleic": 42, "linoleic": 8, "linolenic": 1, "hard": 39, "cleansing": 19, "bubbly": 24, "conditioning": 56, "creamy": 25, "saturated": 39, "mono_unsaturated": 47, "poly_unsaturated": 9 }, { "id": 134, "name": "SoapQuick, organic", "koh_sap": 0.213, "naoh_sap": 0.1518335822491535, "iodine": 56, "ins": 156, "lauric": 13, "myristic": 5, "palmitic": 20, "stearic": 3, "ricinoleic": 0, "oleic": 45, "linoleic": 10, "linolenic": 0, "hard": 41, "cleansing": 18, "bubbly": 18, "conditioning": 55, "creamy": 23, "saturated": 41, "mono_unsaturated": 45, "poly_unsaturated": 10 }, { "id": 45, "name": "Soybean Oil", "koh_sap": 0.191, "naoh_sap": 0.13615124042060245, "iodine": 131, "ins": 61, "lauric": 0, "myristic": 0, "palmitic": 11, "stearic": 5, "ricinoleic": 0, "oleic": 24, "linoleic": 50, "linolenic": 8, "hard": 16, "cleansing": 0, "bubbly": 0, "conditioning": 82, "creamy": 16, "saturated": 16, "mono_unsaturated": 24, "poly_unsaturated": 58 }, { "id": 81, "name": "Soybean, 27.5% hydrogenated", "koh_sap": 0.191, "naoh_sap": 0.13615124042060245, "iodine": 78, "ins": 113, "lauric": 0, "myristic": 0, "palmitic": 9, "stearic": 15, "ricinoleic": 0, "oleic": 41, "linoleic": 7, "linolenic": 1, "hard": 24, "cleansing": 0, "bubbly": 0, "conditioning": 49, "creamy": 24, "saturated": 24, "mono_unsaturated": 41, "poly_unsaturated": 8 }, { "id": 132, "name": "Soybean, fully hydrogenated (soy wax)", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 1, "ins": 191, "lauric": 0, "myristic": 0, "palmitic": 11, "stearic": 87, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 98, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 98, "saturated": 98, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 46, "name": "Stearic Acid", "koh_sap": 0.198, "naoh_sap": 0.1411410764569596, "iodine": 2, "ins": 196, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 99, "ricinoleic": 0, "oleic": 0, "linoleic": 0, "linolenic": 0, "hard": 99, "cleansing": 0, "bubbly": 0, "conditioning": 0, "creamy": 99, "saturated": 99, "mono_unsaturated": 0, "poly_unsaturated": 0 }, { "id": 47, "name": "Sunflower Oil", "koh_sap": 0.189, "naoh_sap": 0.13472557298164325, "iodine": 133, "ins": 63, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 4, "ricinoleic": 0, "oleic": 16, "linoleic": 70, "linolenic": 1, "hard": 11, "cleansing": 0, "bubbly": 0, "conditioning": 87, "creamy": 11, "saturated": 11, "mono_unsaturated": 16, "poly_unsaturated": 71 }, { "id": 71, "name": "Sunflower Oil, high oleic", "koh_sap": 0.189, "naoh_sap": 0.13472557298164325, "iodine": 83, "ins": 106, "lauric": 0, "myristic": 0, "palmitic": 3, "stearic": 4, "ricinoleic": 0, "oleic": 83, "linoleic": 4, "linolenic": 1, "hard": 7, "cleansing": 0, "bubbly": 0, "conditioning": 88, "creamy": 7, "saturated": 7, "mono_unsaturated": 83, "poly_unsaturated": 5 }, { "id": 112, "name": "Tallow Bear", "koh_sap": 0.1946, "naoh_sap": 0.13871744181072898, "iodine": 92, "ins": 100, "lauric": 0, "myristic": 2, "palmitic": 7, "stearic": 3, "ricinoleic": 0, "oleic": 70, "linoleic": 9, "linolenic": 0, "hard": 12, "cleansing": 2, "bubbly": 2, "conditioning": 79, "creamy": 10, "saturated": 12, "mono_unsaturated": 70, "poly_unsaturated": 9 }, { "id": 48, "name": "Tallow Beef", "koh_sap": 0.2, "naoh_sap": 0.1425667438959188, "iodine": 45, "ins": 147, "lauric": 2, "myristic": 6, "palmitic": 28, "stearic": 22, "ricinoleic": 0, "oleic": 36, "linoleic": 3, "linolenic": 1, "hard": 58, "cleansing": 8, "bubbly": 8, "conditioning": 40, "creamy": 50, "saturated": 58, "mono_unsaturated": 36, "poly_unsaturated": 4 }, { "id": 54, "name": "Tallow Deer", "koh_sap": 0.193, "naoh_sap": 0.13757690785956164, "iodine": 31, "ins": 166, "lauric": 0, "myristic": 1, "palmitic": 20, "stearic": 24, "ricinoleic": 0, "oleic": 30, "linoleic": 15, "linolenic": 3, "hard": 45, "cleansing": 1, "bubbly": 1, "conditioning": 48, "creamy": 44, "saturated": 45, "mono_unsaturated": 30, "poly_unsaturated": 18 }, { "id": 123, "name": "Tallow Goat", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 40, "ins": 152, "lauric": 5, "myristic": 11, "palmitic": 23, "stearic": 30, "ricinoleic": 0, "oleic": 29, "linoleic": 2, "linolenic": 0, "hard": 69, "cleansing": 16, "bubbly": 16, "conditioning": 31, "creamy": 53, "saturated": 69, "mono_unsaturated": 29, "poly_unsaturated": 2 }, { "id": 55, "name": "Tallow Sheep", "koh_sap": 0.194, "naoh_sap": 0.13828974157904123, "iodine": 54, "ins": 156, "lauric": 4, "myristic": 10, "palmitic": 24, "stearic": 13, "ricinoleic": 0, "oleic": 26, "linoleic": 5, "linolenic": 0, "hard": 51, "cleansing": 14, "bubbly": 14, "conditioning": 31, "creamy": 37, "saturated": 51, "mono_unsaturated": 26, "poly_unsaturated": 5 }, { "id": 57, "name": "Tamanu Oil, kamani", "koh_sap": 0.208, "naoh_sap": 0.14826941365175553, "iodine": 111, "ins": 82, "lauric": 0, "myristic": 0, "palmitic": 12, "stearic": 13, "ricinoleic": 0, "oleic": 34, "linoleic": 38, "linolenic": 1, "hard": 25, "cleansing": 0, "bubbly": 0, "conditioning": 73, "creamy": 25, "saturated": 25, "mono_unsaturated": 34, "poly_unsaturated": 39 }, { "id": 97, "name": "Tucuma Seed Butter", "koh_sap": 0.238, "naoh_sap": 0.16965442523614335, "iodine": 13, "ins": 175, "lauric": 48, "myristic": 23, "palmitic": 6, "stearic": 0, "ricinoleic": 0, "oleic": 13, "linoleic": 0, "linolenic": 0, "hard": 77, "cleansing": 71, "bubbly": 71, "conditioning": 13, "creamy": 6, "saturated": 77, "mono_unsaturated": 13, "poly_unsaturated": 0 }, { "id": 100, "name": "Ucuuba Butter", "koh_sap": 0.205, "naoh_sap": 0.14613091249331675, "iodine": 38, "ins": 167, "lauric": 0, "myristic": 0, "palmitic": 0, "stearic": 31, "ricinoleic": 0, "oleic": 44, "linoleic": 5, "linolenic": 0, "hard": 31, "cleansing": 0, "bubbly": 0, "conditioning": 49, "creamy": 31, "saturated": 31, "mono_unsaturated": 44, "poly_unsaturated": 5 }, { "id": 105, "name": "Walmart GV Shortening, tallow, palm", "koh_sap": 0.198, "naoh_sap": 0.1411410764569596, "iodine": 49, "ins": 151, "lauric": 1, "myristic": 4, "palmitic": 35, "stearic": 14, "ricinoleic": 0, "oleic": 37, "linoleic": 6, "linolenic": 1, "hard": 54, "cleansing": 5, "bubbly": 5, "conditioning": 44, "creamy": 49, "saturated": 54, "mono_unsaturated": 37, "poly_unsaturated": 7 }, { "id": 49, "name": "Walnut Oil", "koh_sap": 0.189, "naoh_sap": 0.13472557298164325, "iodine": 145, "ins": 45, "lauric": 0, "myristic": 0, "palmitic": 7, "stearic": 2, "ricinoleic": 0, "oleic": 18, "linoleic": 60, "linolenic": 0, "hard": 9, "cleansing": 0, "bubbly": 0, "conditioning": 78, "creamy": 9, "saturated": 9, "mono_unsaturated": 18, "poly_unsaturated": 60 }, { "id": 135, "name": "Watermelon Seed Oil", "koh_sap": 0.19, "naoh_sap": 0.13543840670112287, "iodine": 119, "ins": 71, "lauric": 0, "myristic": 0, "palmitic": 11, "stearic": 10, "ricinoleic": 0, "oleic": 18, "linoleic": 60, "linolenic": 1, "hard": 21, "cleansing": 0, "bubbly": 0, "conditioning": 79, "creamy": 21, "saturated": 21, "mono_unsaturated": 18, "poly_unsaturated": 61 }, { "id": 50, "name": "Wheat Germ Oil", "koh_sap": 0.183, "naoh_sap": 0.1304485706647657, "iodine": 128, "ins": 58, "lauric": 0, "myristic": 0, "palmitic": 17, "stearic": 2, "ricinoleic": 0, "oleic": 17, "linoleic": 58, "linolenic": 0, "hard": 19, "cleansing": 0, "bubbly": 0, "conditioning": 75, "creamy": 19, "saturated": 19, "mono_unsaturated": 17, "poly_unsaturated": 58 }, { "id": 98, "name": "Yangu, cape chestnut", "koh_sap": 0.192, "naoh_sap": 0.13686407414008203, "iodine": 95, "ins": 97, "lauric": 0, "myristic": 0, "palmitic": 18, "stearic": 5, "ricinoleic": 0, "oleic": 45, "linoleic": 30, "linolenic": 1, "hard": 23, "cleansing": 0, "bubbly": 0, "conditioning": 76, "creamy": 23, "saturated": 23, "mono_unsaturated": 45, "poly_unsaturated": 31 }, { "id": 118, "name": "Zapote seed oil, (Aceite de Sapuyul or Mamey)", "koh_sap": 0.188, "naoh_sap": 0.13401273926216367, "iodine": 72, "ins": 116, "lauric": 0, "myristic": 0, "palmitic": 9, "stearic": 21, "ricinoleic": 0, "oleic": 52, "linoleic": 13, "linolenic": 0, "hard": 30, "cleansing": 0, "bubbly": 0, "conditioning": 65, "creamy": 30, "saturated": 30, "mono_unsaturated": 52, "poly_unsaturated": 13 }];
	}
});
