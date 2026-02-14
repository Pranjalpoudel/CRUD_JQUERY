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

    $('#exercise-form').on('submit', function(e) {
        e.preventDefault();
        const exercises = getExercises();
        const newExercise = {
            id: Date.now().toString(),
            name: $('#exercise-name').val().trim(),
            sets: parseInt($('#exercise-sets').val(), 10),
            reps: parseInt($('#exercise-reps').val(), 10),
            weight: parseFloat($('#exercise-weight').val()) || 0,
            date: $('#exercise-date').val()
        };
        exercises.push(newExercise);
        saveExercises(exercises);
        renderExercises();
        this.reset();
        $('#exercise-date').val(new Date().toISOString().slice(0, 10));
    });

    renderExercises();
});
