<script lang="ts">
    import { getUserState } from '$lib/state.svelte';
    let user = getUserState();
    import DefaultAvatar from '$lib/images/PinMapaSnuuperAzul.png';
	let userPhoto = $state('https://files.snuuper.com/' + user.picture);
	if(user.picture == '') {
		userPhoto = DefaultAvatar;
	}
  </script>
  
  <div class="flex flex-col items-center bg-white border-2 rounded-md shadow-lg w-96">
    <!-- Header Illustration -->
    
  
    <!-- Profile Picture -->
    <div class="mt-20">
      <img
        src={userPhoto}
        alt={`Profile picture of ${user.firstname} ${user.lastname}`}
        class="w-40 h-40 border-8 border-white rounded-full shadow-lg"
      />
    </div>
  
    <!-- User Info -->
    <div class="mt-6 text-center">
      <h1 class="text-3xl font-bold text-blue-600">
        {user.firstname} {user.lastname} {user.secondlastname}
      </h1>
      <p class="mt-2 text-gray-600">{user.role} at Company ID: {user.companyId}</p>
    </div>
  
    <!-- Contact Information -->
    <div class="w-11/12 p-6 mt-8 shadow-md bg-blue-50 rounded-xl">
      <h2 class="mb-4 text-2xl font-semibold text-blue-500">Contact Information</h2>
      <div class="space-y-2 text-gray-700">
        <p>
          <span class="font-medium">Email:</span> {user.email}
        </p>
        <p>
          <span class="font-medium">Cellphone:</span> {user.cellphone}
        </p>
        <p>
          <span class="font-medium">Gender:</span> {user.gender}
        </p>
      </div>
    </div>
  
    <!-- Additional Info -->
    <div class="w-11/12 p-6 mt-6 ">
      <div class="flex justify-between p-4 bg-white rounded-lg shadow">
        <p class="text-gray-700">
          <span class="font-medium">Status:</span> {user.status}
        </p>
        <p class="text-gray-700">
          <span class="font-medium">Company Admin:</span> {user.isCompanyAdmin ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  </div>
  