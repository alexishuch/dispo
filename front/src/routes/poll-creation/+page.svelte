<form method="post" action="?/create">
  <label for="name">Nom du sondage :</label>
  <input id="name" name="name" type="text" required />
  <label for="start_date">Date de début :</label>
  <input id="start_date" name="start_date" type="date" required />
  <label for="end_date">Date de fin :</label>
  <input id="end_date" name="end_date" type="date" required />

  <button type="submit">Créer le sondage</button>
</form>
