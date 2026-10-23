<script setup>
</script>

<template>
  <header class="header">
    <div class="search-container">
      <span class="material-symbols-outlined search-icon">search</span>
      <input
        type="text"
        name="search"
        id="search"
        class="search-input"
        placeholder="Buscar Projetos, tarefas ou participantes"
      />
    </div>

    <div class="user-profile">
      <div class="avatar"></div>
    </div>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.header {
  width: 100%;
  background-color: #1A3721;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  box-sizing: border-box;
  gap: 24px;
  font-family: 'Poppins', sans-serif;
}

.search-container {
  display: flex;
  align-items: center;
  flex: 1;
  background-color: #4E7855;
  border-radius: 9999px;
  padding: 8px 18px;
  gap: 12px;
}

.search-icon {
  color: #F6E8D0;
  font-size: 24px;
  user-select: none;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  color: #F6E8D0;
}

.search-input::placeholder {
  color: #1A3721;
  opacity: 1;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  background-color: #F6E8D0;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
