/* Gym Workout Tracker - jQuery Application */
$(function() {
    'use strict';

    const STORAGE_KEY = 'gym-workout-exercises';
    const PLANS_STORAGE_KEY = 'gym-workout-plans';
    const TODAY_PLAN_KEY = 'gym-today-plan';

    function getExercises() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveExercises(exercises) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    }

    function renderExercises() {
        const exercises = getExercises();
        const $tbody = $('#exercise-tbody');
        $tbody.empty();
        exercises.forEach(function(ex) {
            const row = '<tr data-id="' + ex.id + '">' +
                '<td>' + $('<div>').text(ex.name).html() + '</td>' +
                '<td>' + ex.sets + '</td>' +
                '<td>' + ex.reps + '</td>' +
                '<td>' + ex.weight + ' kg</td>' +
                '<td>' + ex.date + '</td>' +
                '<td class="actions-cell">' +
                '<button type="button" class="btn btn-edit">Edit</button>' +
                '<button type="button" class="btn btn-delete">Delete</button>' +
                '</td></tr>';
            $tbody.append(row);
        });
    }

    $('#exercise-date').val(new Date().toISOString().slice(0, 10));

    let editingId = null;

    $('#exercise-form').on('submit', function(e) {
        e.preventDefault();
        const exercises = getExercises();
        const name = $('#exercise-name').val().trim();
        const sets = parseInt($('#exercise-sets').val(), 10);
        const reps = parseInt($('#exercise-reps').val(), 10);
        const weight = parseFloat($('#exercise-weight').val()) || 0;
        const date = $('#exercise-date').val();

        if (editingId) {
            const idx = exercises.findIndex(function(ex) { return ex.id === editingId; });
            if (idx !== -1) {
                exercises[idx] = { id: editingId, name: name, sets: sets, reps: reps, weight: weight, date: date };
                saveExercises(exercises);
                renderExercises();
                renderPRs();
                editingId = null;
                $('#add-exercise-btn').text('Add Exercise');
            }
        } else {
            const newExercise = {
                id: Date.now().toString(),
                name: name,
                sets: sets,
                reps: reps,
                weight: weight,
                date: date
            };
            exercises.push(newExercise);
            saveExercises(exercises);
            renderExercises();
        }
        this.reset();
        $('#exercise-date').val(new Date().toISOString().slice(0, 10));
        renderPRs();
    });

    $('#exercise-tbody').on('click', '.btn-delete', function() {
        const id = $(this).closest('tr').data('id');
        const exercises = getExercises().filter(function(ex) { return ex.id !== id; });
        saveExercises(exercises);
        renderExercises();
        renderPRs();
    });

    $('#exercise-tbody').on('click', '.btn-edit', function() {
        const id = $(this).closest('tr').data('id');
        const exercises = getExercises();
        const ex = exercises.find(function(e) { return e.id === id; });
        if (!ex) return;
        editingId = id;
        $('#exercise-name').val(ex.name);
        $('#exercise-sets').val(ex.sets);
        $('#exercise-reps').val(ex.reps);
        $('#exercise-weight').val(ex.weight);
        $('#exercise-date').val(ex.date);
        $('#add-exercise-btn').text('Update Exercise');
    });

    function getPRs() {
        const exercises = getExercises();
        const prs = {};
        exercises.forEach(function(ex) {
            const key = ex.name.trim().toLowerCase();
            if (!key) return;
            const w = parseFloat(ex.weight) || 0;
            if (!prs[key] || w > prs[key].weight) {
                prs[key] = { name: ex.name.trim(), weight: w };
            }
        });
        return Object.values(prs).sort(function(a, b) { return b.weight - a.weight; });
    }

    function renderPRs() {
        const prs = getPRs();
        const $list = $('#pr-list');
        $list.empty();
        prs.forEach(function(pr) {
            $list.append('<li><span class="pr-exercise">' + $('<div>').text(pr.name).html() + '</span><span class="pr-weight">' + pr.weight + ' kg</span></li>');
        });
    }

    renderExercises();
    renderPRs();

    function getPlans() {
        const data = localStorage.getItem(PLANS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function savePlans(plans) {
        localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
    }

    function createPlanExerciseRow() {
        const row = $('<div class="plan-exercise-row"></div>');
        row.append($('<input type="text" placeholder="Exercise name">'));
        row.append($('<input type="number" placeholder="Sets" min="1">'));
        row.append($('<input type="number" placeholder="Reps" min="1">'));
        row.append($('<input type="number" placeholder="Weight" min="0" step="0.5">'));
        row.append($('<button type="button" class="btn btn-remove">Remove</button>'));
        row.find('.btn-remove').on('click', function() { row.remove(); });
        return row;
    }

    function getPlanFormData() {
        const exercises = [];
        $('#plan-exercises-list .plan-exercise-row').each(function() {
            const $r = $(this);
            const name = $r.find('input').eq(0).val().trim();
            const sets = parseInt($r.find('input').eq(1).val(), 10) || 0;
            const reps = parseInt($r.find('input').eq(2).val(), 10) || 0;
            const weight = parseFloat($r.find('input').eq(3).val()) || 0;
            if (name) exercises.push({ name: name, sets: sets, reps: reps, weight: weight });
        });
        return exercises;
    }

    function resetPlanForm() {
        $('#plan-name').val('');
        $('#plan-edit-id').val('');
        $('#plan-exercises-list').empty();
        $('#save-plan-btn').text('Save Plan');
    }

    function renderPlansList() {
        const plans = getPlans();
        const $list = $('#plans-list');
        $list.empty();
        plans.forEach(function(p) {
            const exCount = p.exercises ? p.exercises.length : 0;
            const li = $('<li></li>');
            li.append('<span class="plan-item-name">' + $('<div>').text(p.name).html() + ' (' + exCount + ' exercises)</span>');
            const actions = $('<span class="plan-item-actions"></span>');
            actions.append('<button type="button" class="btn btn-edit btn-sm plan-edit" data-id="' + p.id + '">Edit</button>');
            actions.append('<button type="button" class="btn btn-delete btn-sm plan-delete" data-id="' + p.id + '">Delete</button>');
            li.append(actions);
            $list.append(li);
        });
    }

    $('#add-plan-exercise').on('click', function() {
        $('#plan-exercises-list').append(createPlanExerciseRow());
    });

    $('#plan-form').on('submit', function(e) {
        e.preventDefault();
        const name = $('#plan-name').val().trim();
        const exercises = getPlanFormData();
        const editId = $('#plan-edit-id').val();
        const plans = getPlans();

        if (editId) {
            const idx = plans.findIndex(function(p) { return p.id === editId; });
            if (idx !== -1) {
                plans[idx] = { id: editId, name: name, exercises: exercises };
                savePlans(plans);
                renderPlansList();
                renderTodayPlanSelect();
                renderTodayWorkout();
                resetPlanForm();
            }
        } else {
            plans.push({ id: Date.now().toString(), name: name, exercises: exercises });
            savePlans(plans);
            renderPlansList();
            renderTodayPlanSelect();
            renderTodayWorkout();
            resetPlanForm();
        }
    });

    $('#plans-list').on('click', '.plan-delete', function() {
        const id = $(this).data('id');
        const plans = getPlans().filter(function(p) { return p.id !== id; });
        savePlans(plans);
        renderPlansList();
        renderTodayPlanSelect();
        renderTodayWorkout();
        if ($('#plan-edit-id').val() === id) resetPlanForm();
    });

    $('#plans-list').on('click', '.plan-edit', function() {
        const id = $(this).data('id');
        const plans = getPlans();
        const plan = plans.find(function(p) { return p.id === id; });
        if (!plan) return;
        $('#plan-name').val(plan.name);
        $('#plan-edit-id').val(plan.id);
        $('#plan-exercises-list').empty();
        (plan.exercises || []).forEach(function(ex) {
            const row = createPlanExerciseRow();
            row.find('input').eq(0).val(ex.name);
            row.find('input').eq(1).val(ex.sets);
            row.find('input').eq(2).val(ex.reps);
            row.find('input').eq(3).val(ex.weight);
            $('#plan-exercises-list').append(row);
        });
        $('#save-plan-btn').text('Update Plan');
    });

    renderPlansList();

    function renderTodayPlanSelect() {
        const plans = getPlans();
        const selected = localStorage.getItem(TODAY_PLAN_KEY) || '';
        const $select = $('#today-plan-select');
        $select.find('option').not(':first').remove();
        plans.forEach(function(p) {
            $select.append($('<option></option>').val(p.id).text(p.name).prop('selected', p.id === selected));
        });
        if (selected) $select.val(selected);
    }

    function renderTodayWorkout() {
        const planId = $('#today-plan-select').val() || localStorage.getItem(TODAY_PLAN_KEY);
        const $cards = $('#today-workout-cards');
        $cards.empty();
        if (!planId) return;
        const plans = getPlans();
        const plan = plans.find(function(p) { return p.id === planId; });
        if (!plan || !plan.exercises || plan.exercises.length === 0) return;
        plan.exercises.forEach(function(ex, i) {
            const details = ex.sets + ' Sets x ' + ex.reps + ' Reps @ ' + ex.weight + ' kg';
            const card = $('<div class="workout-card"></div>');
            card.append('<div class="workout-card-icon">🏋️</div>');
            card.append('<div class="workout-card-title">' + $('<div>').text(ex.name).html() + '</div>');
            card.append('<div class="workout-card-details">' + details + '</div>');
            if (i === 0) card.addClass('active');
            $cards.append(card);
        });
    }

    $('#today-plan-select').on('change', function() {
        const val = $(this).val();
        localStorage.setItem(TODAY_PLAN_KEY, val || '');
        renderTodayWorkout();
    });

    renderTodayPlanSelect();
    renderTodayWorkout();

    function getBMIClassification(bmi) {
        if (bmi < 18.5) return { label: 'Underweight', cls: 'underweight' };
        if (bmi < 25) return { label: 'Normal', cls: 'normal' };
        if (bmi < 30) return { label: 'Overweight', cls: 'overweight' };
        return { label: 'Obese', cls: 'obese' };
    }

    $('#bmi-form').on('submit', function(e) {
        e.preventDefault();
        const height = parseFloat($('#bmi-height').val()) || 0;
        const weight = parseFloat($('#bmi-weight').val()) || 0;
        const $result = $('#bmi-result');
        if (height <= 0 || weight <= 0) {
            $result.removeClass('normal underweight overweight obese').addClass('error').text('Enter valid height and weight.');
            return;
        }
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        const info = getBMIClassification(bmi);
        $result.removeClass('normal underweight overweight obese error').addClass(info.cls)
            .text('Your BMI: ' + bmi.toFixed(1) + ' (' + info.label + ')');
    });
});
