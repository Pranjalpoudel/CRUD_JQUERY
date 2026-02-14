/* Gym Workout Tracker - jQuery Application */
$(function() {
    'use strict';

    const STORAGE_KEY = 'gym-workout-exercises';

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
    });

    $('#exercise-tbody').on('click', '.btn-delete', function() {
        const id = $(this).closest('tr').data('id');
        const exercises = getExercises().filter(function(ex) { return ex.id !== id; });
        saveExercises(exercises);
        renderExercises();
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

    renderExercises();
});
